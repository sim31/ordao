import { z } from 'zod';
import { ArrayTypeInfo, extractZodDescription, isPrimitive, ObjectTypeInfo, PrimitiveTypeInfo, strTypeMaxLength, TypeInfo, zodObjectFields } from '@ordao/zod-utils';
import { DefaultValues, FieldErrors, GlobalError, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assertUnreachable } from '@ordao/ts-utils';
import { Button, Field, Fieldset, HStack, Input, NumberInput, Stack, Textarea } from '@chakra-ui/react';

// TODO: extract zod reflection stuff to separate library

interface ZodFormProps<T extends z.AnyZodObject> {
  schema: T
  onSubmit: (data: z.infer<T>) => void;
  defaultValues?: DefaultValues<z.infer<T>>
  submitButtonText?: string
}

type Errors = FieldErrors<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}>;
type Error = GlobalError;

function ZodForm<T extends z.AnyZodObject>({
  schema,
  onSubmit,
  submitButtonText,
  defaultValues
}: ZodFormProps<T>) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: defaultValues
  });

  const fields = zodObjectFields(schema);
  const { description } = extractZodDescription(schema);
  const formValues = watch();
  const submitText = submitButtonText ?? 'Submit';

  const prefixStr = (str: string, prefix?: string) => {
    return prefix !== undefined ? `${prefix}.${str}` : str;
  }

  const setValueAsForStr = (value: unknown) => {
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return undefined;
      } else {
        return value;
      }
    } else {
      return undefined;
    }
  }

  // TODO: create component for each type of input.
  // Currently not doing that because not sure how to pass values returned from useForm
  const renderStringInput = (fieldName: string) => {
    return (
      <Input {...register(fieldName, { setValueAs: setValueAsForStr })}/>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderTextArea = (fieldName: string, _maxLength?: number) => {
    // TODO: Adjust size based on maxLength
    return (
      <Textarea minHeight="8em" {...register(fieldName, { setValueAs: setValueAsForStr })}/>
    )
  }

  const renderNumber = (fieldName: string, typeInfo: PrimitiveTypeInfo) => {
    const setValueAs = typeInfo.typeName === 'number'
      ? (v: unknown) => {
        if (typeof v === 'string' && v.trim() === '') {
          return undefined;
        } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint') {
          return Number(v);
        } else {
          return undefined
        }
      }
      : (v: unknown) => {
        if (typeof v === 'string' && v.trim() === '') {
          return undefined;
        } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint') {
          return BigInt(v);
        } else {
          return undefined;
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
    // console.log("array field name: ", fieldName, "array values: ", arrayValues);

    return (
      <Fieldset.Root>
        <Fieldset.Content pl="2em">
          {arrayValues.map((_, index) => {
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
      <Button color="black" mt="2em" as="button" type="submit">{submitText}</Button>
    </form>
  );
}

export default ZodForm;