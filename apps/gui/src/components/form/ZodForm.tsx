import { z, ZodStringCheck } from 'zod';
import { FieldErrors, GlobalError, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assertUnreachable } from '@ordao/ts-utils';
import { Button, Field, Fieldset, HStack, Input, NumberInput, Stack, Textarea } from '@chakra-ui/react';

// TODO: extract zod reflection stuff to separate library
const primitiveTypeNames = ['number', 'bigint', 'boolean'] as const;
type PrimitiveTypeName = typeof primitiveTypeNames[number];
type ObjectTypeName = 'object';
type ArrayTypeName = 'array';
type StringTypeName = 'string'
type TypeName = PrimitiveTypeName | StringTypeName | ObjectTypeName | ArrayTypeName;
interface TypeInfoBase {
  typeName: TypeName,
  schema: z.ZodSchema,
  optional?: boolean,
  defaultValue?: unknown,
  title?: string,
  description?: string
}
interface PrimitiveTypeInfo extends TypeInfoBase {
  typeName: PrimitiveTypeName
}
interface ObjectTypeInfo extends TypeInfoBase {
  typeName: ObjectTypeName
  fields: Record<string, TypeInfo>
}
interface ArrayTypeInfo extends TypeInfoBase {
  typeName: ArrayTypeName
  elementType: TypeInfo
  min?: number,
  max?: number
}
interface StringTypeInfo extends TypeInfoBase {
  typeName: 'string',
  checks: ZodStringCheck[]
}
type TypeInfo = PrimitiveTypeInfo | StringTypeInfo | ObjectTypeInfo | ArrayTypeInfo;

function strTypeLength(strt: StringTypeInfo): number | undefined {
  const length = strt.checks.find(c => c.kind === 'length');
  return length?.value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function strTypeMinLength(strt: StringTypeInfo): number | undefined {
  const length = strTypeLength(strt);
  if (length) {
    return length;
  } else {
    const min = strt.checks.find(c => c.kind === 'min');
    return min?.value;
  }
}

function strTypeMaxLength(strt: StringTypeInfo): number | undefined {
  const length = strTypeLength(strt);
  if (length) {
    return length;
  } else {
    const max = strt.checks.find(c => c.kind === 'max');
    return max?.value;
  } 
}

function isPrimitive(typeInfo: TypeInfo): typeInfo is PrimitiveTypeInfo {
  return primitiveTypeNames.find(tn => tn === typeInfo.typeName) !== undefined;
}

interface TypeTitleDesc {
  title?: string,
  description?: string
}

const descriptionRe = /^(?:\s)?([^\n]+)\n{2}((?:\s|\S)*)$/g;

function extractDescription(schema: z.ZodTypeAny): TypeTitleDesc {
  const description = schema.description;
  const r: TypeTitleDesc = {};
  if (description !== undefined) {
    const titleDescMatch = new RegExp(descriptionRe).exec(description);
    if (titleDescMatch) {
      r.title = titleDescMatch[1];
      const d = titleDescMatch[2].trimStart();
      r.description = d.length === 0 ? undefined : d;
    } else {
      const d = description.trimStart();
      r.description = d.length === 0 ? undefined : d;
    }
  }
  return r;
}

function zodEffectInnerType<T extends z.ZodTypeAny>(effect: z.ZodEffects<T>) {
  return effect.innerType();
}

function zodOptionalInnerType<T extends z.ZodTypeAny>(optional: z.ZodOptional<T>) {
  return optional.unwrap();
}

function zodPipelineInnerType<A extends z.ZodTypeAny, B extends z.ZodTypeAny>(pipeline: z.ZodPipeline<A, B>) {
  return pipeline._def.out;
}

function zodDefaultValue<T extends z.ZodTypeAny>(schema: z.ZodDefault<T>): z.infer<T> {
  return schema._def.defaultValue;
}

function zodDefaultInnerType<T extends z.ZodTypeAny>(schema: z.ZodDefault<T>): T {
  return schema._def.innerType;
}

function objectFields<T extends z.AnyZodObject>(schema: T): Record<string, TypeInfo> {
  const r: Record<string, TypeInfo> = {};
  for (const field in schema.shape) {
    const fieldType = schema.shape[field];
    r[field] = getTypeInfo(fieldType);
  }
  return r;
}

function zodTypeStr<T extends z.ZodTypeAny>(type: T): string {
  return type._def.typeName;
}

function arrayElementType<T extends z.ZodTypeAny>(array: z.ZodArray<T>): TypeInfo {
  return getTypeInfo(array.element);
}

function zodArrayMinLength<T extends z.ZodTypeAny>(array: z.ZodArray<T>): number | undefined {
  return array._def.minLength === null ? undefined : array._def.minLength.value;
}

function zodArrayMaxLength<T extends z.ZodTypeAny>(array: z.ZodArray<T>): number | undefined {
  return array._def.maxLength === null ? undefined : array._def.maxLength.value;
}

function zodStringChecks(zstr: z.ZodString): z.ZodStringCheck[] {
  return zstr._def.checks;
}

function overwriteDescription<T extends z.ZodTypeAny>(typeInfo: TypeInfo, schema: T): TypeInfo {
  const { title, description } = extractDescription(schema);
  if (title !== undefined || description !== undefined) {
    return {
      ...typeInfo,
      title,
      description
    }
  } else {
    return typeInfo;
  }
}


function getTypeInfo<T extends z.ZodTypeAny>(schema: T): TypeInfo {
  const typeStr = zodTypeStr(schema);
  switch (typeStr) {
    case 'ZodDefault': {
      const ti = getTypeInfo(zodDefaultInnerType(schema as z.infer<T>));
      ti.defaultValue = zodDefaultValue(schema as z.infer<T>);
      return overwriteDescription(ti, schema);            
    }
    case 'ZodEffects': {
      const ti = getTypeInfo(zodEffectInnerType(schema as z.infer<T>));
      return overwriteDescription(ti, schema);
    }
    case 'ZodOptional': {
      const ti = getTypeInfo(zodOptionalInnerType(schema as z.infer<T>));
      ti.optional = true;
      return overwriteDescription(ti, schema);
    }
    case 'ZodPipeline': {
      const ti = getTypeInfo(zodPipelineInnerType(schema as z.infer<T>));
      return overwriteDescription(ti, schema);
    }
    case 'ZodObject': {
      const r: ObjectTypeInfo = {
        typeName: 'object',
        schema,
        fields: objectFields(schema as z.infer<T>),
        ...extractDescription(schema)
      };
      return r;
    }
    case 'ZodArray': {
      const r: ArrayTypeInfo = {
        typeName: 'array',
        schema,
        elementType: arrayElementType(schema as z.infer<T>),
        min: zodArrayMinLength(schema as z.infer<T>),
        max: zodArrayMaxLength(schema as z.infer<T>),
        ...extractDescription(schema)
      };
      return r;
    }
    case 'ZodNumber':
      return { typeName: 'number', schema, ...extractDescription(schema) }
    case 'ZodBigInt':
      return { typeName: 'bigint', schema, ...extractDescription(schema) };
    case 'ZodString': {
      const r: StringTypeInfo = {
        typeName: 'string',
        schema,
        checks: zodStringChecks(schema as z.infer<T>),
        ...extractDescription(schema)
      };
      return r;
    }
    case 'ZodBoolean':
      return { typeName: 'boolean', schema, ...extractDescription(schema) };
    default:
      throw new Error(`Unknown type: ${typeStr}`);
  }
}

interface ZodFormProps<T extends z.AnyZodObject> {
  schema: T
  onSubmit: (data: z.infer<T>) => void;
}

type Errors = FieldErrors<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}>;
type Error = GlobalError;

function ZodForm<T extends z.AnyZodObject>({ schema, onSubmit }: ZodFormProps<T>) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const fields = objectFields(schema);
  const { description } = extractDescription(schema);
  const formValues = watch();

  const prefixStr = (str: string, prefix?: string) => {
    return prefix !== undefined ? `${prefix}.${str}` : str;
  }

  // TODO: create component for each type of input.
  // Currently not doing that because not sure how to pass values returned from useForm
  const renderStringInput = (fieldName: string) => {
    return (
      <Input {...register(fieldName)}/>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderTextArea = (fieldName: string, maxLength?: number) => {
    // TODO: Adjust size based on maxLength
    return (
      <Textarea minHeight="8em" {...register(fieldName)}/>
    )
  }

  const renderNumber = (fieldName: string, typeInfo: PrimitiveTypeInfo) => {
    const setValueAs = typeInfo.typeName === 'number'
      ? (v: string) => {
        if (v.trim() === '') {
          return undefined;
        } else {
          return Number(v);
        }
      }
      : (v: string) => {
        if (v.trim() === '') {
          return undefined;
        } else {
          return BigInt(v);
        }
      }

    return (
      <NumberInput.Root>
        <NumberInput.Input {...register(fieldName, { setValueAs })} />
      </NumberInput.Root>
    )
  }

  const renderPrimitiveInput = (fieldName: string, typeInfo: PrimitiveTypeInfo) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switch (typeInfo.typeName) {
      case 'number':
      case 'bigint': {
        return renderNumber(fieldName, typeInfo);
      }
      case 'boolean': {
        return <div>TODO: https://chakra-ui.com/docs/components/checkbox#hook-form</div>
      }
      default:
        assertUnreachable(typeInfo.typeName);
    }
  }


  const renderObject = (fieldName: string, typeInfo: ObjectTypeInfo, error?: Error) => {
    return (
      <Fieldset.Root>
        <Fieldset.Content pl="2em">
          {renderFields(typeInfo.fields, `${fieldName}.`, error as Errors)}
        </Fieldset.Content>
      </Fieldset.Root>

    )
  }

  const renderArray = (fieldName: string, typeInfo: ArrayTypeInfo, error?: Error) => {
    // This probably won't work for arrays nested more deeply;
    let arrayValues = formValues[fieldName] as unknown[];
    const minSize = typeInfo.min;
    if (arrayValues === undefined) {
      arrayValues = new Array(minSize !== undefined ? minSize : 1).fill("");
    }
    const errors = error !== undefined ? error as Errors : undefined;
    console.log("array field name: ", fieldName, "array values: ", arrayValues);

    return (
      <Fieldset.Root>
        <Fieldset.Content pl="2em">
          {arrayValues.map((item, index) => {
            return renderField(
              `${index}`,
              typeInfo.elementType,
              `${fieldName}.`,
              errors !== undefined ? errors[index] : undefined
            );
          })}
        <HStack>
          <Button width="50%" color="black" onClick={() => setValue(fieldName, [...arrayValues, ''])}>Add</Button>
          <Button width="50%" color="black" onClick={() => setValue(fieldName, arrayValues.slice(0, -1))}>Remove</Button>
        </HStack>
        </Fieldset.Content>
      </Fieldset.Root>
    )
  }

  const renderInput = (fieldName: string, typeInfo: TypeInfo, error?: Error) => {
    if (isPrimitive(typeInfo)) {
      return renderPrimitiveInput(fieldName, typeInfo);
    } else if (typeInfo.typeName === 'string') {
      const maxLength = strTypeMaxLength(typeInfo);
      if (maxLength === undefined || maxLength > 80) {
        return renderTextArea(fieldName, maxLength);
      } else {
        return renderStringInput(fieldName);
      }
    } else if (typeInfo.typeName === 'object') {
      return renderObject(fieldName, typeInfo, error);
    } else if (typeInfo.typeName === 'array') {
      return renderArray(fieldName, typeInfo, error);
    } else {
      // assertUnreachable(typeInfo.typeName);
    }
  };

  const renderField = (fieldName: string, typeInfo: TypeInfo, prefix?: string, error?: Error) => {
    const f = prefixStr(fieldName, prefix);
    return (
      <Field.Root invalid={!!error} key={f} required={!typeInfo.optional}>
        <Field.Label>{typeInfo.title || fieldName} <Field.RequiredIndicator /></Field.Label>
        <Field.HelperText
          wordBreak="break-word"
          whiteSpace="pre-wrap"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {typeInfo.description}
        </Field.HelperText>
        {renderInput(f, typeInfo, error)}
        <Field.ErrorText maxWidth="42em" wordBreak="break-word">{error?.message?.toString()}</Field.ErrorText>
      </Field.Root>
    )
  }

  const renderFields = (fields: Record<string, TypeInfo>, prefix?: string, errors?: Errors) => {
    return Object.entries(fields).map(([fieldName, typeInfo]) => renderField(fieldName, typeInfo, prefix, errors?.[fieldName]));
  }

  return (
    <form onSubmit={handleSubmit((onSubmit))}>
      <Fieldset.Root>
        <Stack gap="4" align="flex-start">
          <Fieldset.HelperText fontSize="md" maxWidth="42em">{description}</Fieldset.HelperText>
          <Fieldset.Content borderTop="solid" borderColor="gray.200" pt="1em">
            {renderFields(fields, undefined, errors)}
          </Fieldset.Content>
        </Stack>
      </Fieldset.Root>
      {/* <button type="submit">Submit</button> */}
      <Button color="black" mt="2em" as="button" type="submit">Submit</Button>
    </form>
  );
}

export default ZodForm;