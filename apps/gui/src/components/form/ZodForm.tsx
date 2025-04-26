import { z, ZodStringCheck } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assertUnreachable, stringify } from '@ordao/ts-utils';
import { Field, Input, NumberInput, Stack, Textarea } from '@chakra-ui/react';

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
  title?: string,
  description?: string
}
interface PrimitiveTypeInfo extends TypeInfoBase {
  typeName: PrimitiveTypeName
}
interface ObjectTypeInfo extends TypeInfoBase {
  typeName: ObjectTypeName
  fields: Record<string, TypeInfoBase>
}
interface ArrayTypeInfo extends TypeInfoBase {
  typeName: ArrayTypeName
  elementType: TypeInfoBase
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
    console.log("description: ", description);
    const titleDescMatch = new RegExp(descriptionRe).exec(description);
    if (titleDescMatch) {
      r.title = titleDescMatch[1];
      r.description = titleDescMatch[2];
      console.log("Found title and desc: ", stringify(r))
    } else {
      r.description = description;
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
    case 'ZodEffects': {
      const ti = getTypeInfo(zodEffectInnerType(schema as z.infer<T>));
      return overwriteDescription(ti, schema);
    }
    case 'ZodOptional': {
      const ti = getTypeInfo(zodOptionalInnerType(schema as z.infer<T>));
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

function ZodForm<T extends z.AnyZodObject>({ schema, onSubmit }: ZodFormProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit"
  });

  const fields = objectFields(schema);

  // TODO: create component for each type of input.
  // Currently not doing that because not sure how to pass values returned from useForm
  const renderStringInput = (fieldName: string) => {
    return (
      <Input width="100%" {...register(fieldName)}/>
    )
  }

  const renderTextArea = (fieldName: string) => {
    return (
      <Textarea width="100%"{...register(fieldName)}/>
    )
  }


  const renderPrimitiveInput = (fieldName: string, typeInfo: PrimitiveTypeInfo) => {
    console.log("Rendering primitive field", fieldName, typeInfo);
    switch (typeInfo.typeName) {
      case 'number':
      case 'bigint': {
        return (
          <NumberInput.Root>
            <NumberInput.Control />
            <NumberInput.Input {...register(fieldName)} />
          </NumberInput.Root>
        )
      }
      case 'boolean': {
        return <div>TODO: https://chakra-ui.com/docs/components/checkbox#hook-form</div>
      }
      default:
        assertUnreachable(typeInfo.typeName);
    }
  }

  const renderInput = (fieldName: string, typeInfo: TypeInfo) => {
    if (isPrimitive(typeInfo)) {
      return renderPrimitiveInput(fieldName, typeInfo);
    } else if (typeInfo.typeName === 'string') {
      const maxLength = strTypeMaxLength(typeInfo);
      if (maxLength === undefined || maxLength > 64) {
        return renderTextArea(fieldName);
      } else {
        return renderStringInput(fieldName);
      }
    } else if (typeInfo.typeName === 'object') {
      return <div>TODO: 'object'</div>
    } else if (typeInfo.typeName === 'array') {
      return <div>TODO: 'array'</div>
    } else {
      // assertUnreachable(typeInfo.typeName);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4" align="flex-start">
        {Object.entries(fields).map(([fieldName, typeInfo]) => (
          <Field.Root invalid={!!errors[fieldName]}>
            <Field.Label>{typeInfo.title || fieldName}</Field.Label>
            {renderInput(fieldName, typeInfo)}
            <Field.ErrorText>{errors[fieldName]?.message?.toString()}</Field.ErrorText>
            <Field.HelperText>{typeInfo.description}</Field.HelperText>
          </Field.Root>
        ))}
      </Stack>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ZodForm;