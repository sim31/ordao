import { z } from 'zod';
import { ArrayTypeInfo, extractZodDescription, isPrimitive, ObjectTypeInfo, PrimitiveTypeInfo, strTypeMaxLength, TypeInfo, zodObjectFields } from '@ordao/zod-utils';
import { DefaultValues, FieldErrors, GlobalError, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assertUnreachable } from '@ordao/ts-utils';
import { Field, Fieldset, HStack, Input, NumberInput, Stack, Textarea } from '@chakra-ui/react';
import { Button } from "../Button";
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

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

  // Track CSV imports per array field name
  const [csvImports, setCsvImports] = useState<Record<string, { fileName: string }>>({});
  const [csvTargetField, setCsvTargetField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // (Optional) We could cache field maps for arrays of objects if needed in future

  const openCsvPicker = (fieldName: string) => {
    setCsvTargetField(fieldName);
    if (fileInputRef.current) {
      // reset the input so selecting the same file again triggers change
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // CSV parsing is handled by PapaParse in onFileSelected

  const coerceValue = (value: string, ti: TypeInfo): unknown => {
    if (ti.typeName === 'string') {
      const v = value.trim();
      return v === '' ? undefined : v;
    }
    if (isPrimitive(ti)) {
      const v = value.trim();
      if (v === '') return undefined;
      switch (ti.typeName) {
        case 'number':
          return Number(v);
        case 'bigint':
          try { return BigInt(v); } catch { return undefined; }
        case 'boolean':
          return /^(true|1|yes)$/i.test(v) ? true : /^(false|0|no)$/i.test(v) ? false : undefined;
        default:
          return undefined;
      }
    }
    // For objects/arrays in CSV, leave undefined
    return undefined;
  };

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !csvTargetField) return;
    try {
      const text = await file.text();
      // Parse with headers so we get array of objects keyed by column names
      const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
      if (parsed.errors && parsed.errors.length > 0) {
        console.error('CSV parse errors', parsed.errors);
      }
      const rows: Array<Record<string, string>> = parsed.data;
      // Map CSV to objects if target field expects array of objects
      const tinfo = fields[csvTargetField];
      if (!(tinfo && tinfo.typeName === 'array' && tinfo.elementType.typeName === 'object')) {
        throw new Error('CSV import is only supported for arrays of objects');
      }
      const objFields = (tinfo.elementType as ObjectTypeInfo).fields;
      const mapped = rows.map((r: Record<string, string>) => {
        const o: Record<string, unknown> = {};
        Object.entries(objFields).forEach(([key, ti]) => {
          const cell = r[key] ?? '';
          o[key] = coerceValue(String(cell ?? ''), ti);
        });
        return o;
      });
      setValue(csvTargetField, mapped, { shouldDirty: true, shouldValidate: true });
      setCsvImports((prev) => ({ ...prev, [csvTargetField]: { fileName: file.name } }));
    } catch (err) {
      console.error('CSV parse error', err);
      // Surface an error to the user? For now, log only.
    } finally {
      setCsvTargetField(null);
      // Clear the input value so the same file can be chosen again later
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

    const isArrayOfObjects = typeInfo.elementType.typeName === 'object';
    const hasCsv = csvImports[fieldName] !== undefined;

    return (
      <Fieldset.Root>
        <Fieldset.Content pl="2em">
          {/* CSV Import controls for arrays of objects */}
          {isArrayOfObjects && (
            <HStack justifyContent="space-between" mb="0.5em">
              {!hasCsv ? (
                <Button onClick={() => openCsvPicker(fieldName)}>Import as CSV</Button>
              ) : (
                <HStack>
                  <span>Imported: {csvImports[fieldName].fileName}</span>
                  <Button onClick={() => setCsvImports((prev) => { const { [fieldName]: _omit, ...rest } = prev; return rest; })}>
                    Cancel
                  </Button>
                </HStack>
              )}
            </HStack>
          )}

          {/* Keep manual array form inputs visible even when CSV is imported */}
          <>
            {arrayValues.map((_, index) => {
              return renderField(
                `${index}`,
                typeInfo.elementType,
                `${fieldName}.`,
                errors !== undefined ? errors[index] : undefined
              );
            })}
            <HStack>
              <Button width="50%" onClick={() => {
                const defaultEl = typeInfo.elementType.typeName === 'object' ? {} : '';
                setValue(fieldName, [...arrayValues, defaultEl]);
              }}>Add</Button>
              <Button width="50%" onClick={() => setValue(fieldName, arrayValues.slice(0, -1))}>Remove</Button>
            </HStack>
          </>
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
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileSelected}
      />
      {/* <button type="submit">Submit</button> */}
      <Button color="black" mt="2em" as="button" type="submit">{submitText}</Button>
    </form>
  );
}

export default ZodForm;