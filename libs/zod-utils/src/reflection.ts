import { z, ZodStringCheck } from "zod";

export const primitiveTypeNames = ['number', 'bigint', 'boolean'] as const;
export type PrimitiveTypeName = typeof primitiveTypeNames[number];
export type ObjectTypeName = 'object';
export type ArrayTypeName = 'array';
export type StringTypeName = 'string'
export type TypeName = PrimitiveTypeName | StringTypeName | ObjectTypeName | ArrayTypeName;
export interface TypeInfoBase {
  typeName: TypeName,
  schema: z.ZodSchema,
  optional?: boolean,
  defaultValue?: unknown,
  title?: string,
  description?: string
}
export interface PrimitiveTypeInfo extends TypeInfoBase {
  typeName: PrimitiveTypeName
}
export interface ObjectTypeInfo extends TypeInfoBase {
  typeName: ObjectTypeName
  fields: Record<string, TypeInfo>
}
export interface ArrayTypeInfo extends TypeInfoBase {
  typeName: ArrayTypeName
  elementType: TypeInfo
  min?: number,
  max?: number
}
export interface StringTypeInfo extends TypeInfoBase {
  typeName: 'string',
  checks: ZodStringCheck[]
}
export type TypeInfo = PrimitiveTypeInfo | StringTypeInfo | ObjectTypeInfo | ArrayTypeInfo;

export function strTypeLength(strt: StringTypeInfo): number | undefined {
  const length = strt.checks.find(c => c.kind === 'length');
  return length?.value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function strTypeMinLength(strt: StringTypeInfo): number | undefined {
  const length = strTypeLength(strt);
  if (length) {
    return length;
  } else {
    const min = strt.checks.find(c => c.kind === 'min');
    return min?.value;
  }
}

export function strTypeMaxLength(strt: StringTypeInfo): number | undefined {
  const length = strTypeLength(strt);
  if (length) {
    return length;
  } else {
    const max = strt.checks.find(c => c.kind === 'max');
    return max?.value;
  } 
}

export function isPrimitive(typeInfo: TypeInfo): typeInfo is PrimitiveTypeInfo {
  return primitiveTypeNames.find(tn => tn === typeInfo.typeName) !== undefined;
}

export interface TypeTitleDesc {
  title?: string,
  description?: string
}

const descriptionRe = /^(?:\s)?([^\n]+)\n{2}((?:\s|\S)*)$/g;

export function extractZodDescription(schema: z.ZodTypeAny): TypeTitleDesc {
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

export function zodEffectInnerType<T extends z.ZodTypeAny>(effect: z.ZodEffects<T>) {
  return effect.innerType();
}

export function zodOptionalInnerType<T extends z.ZodTypeAny>(optional: z.ZodOptional<T>) {
  return optional.unwrap();
}

export function zodPipelineInnerType<A extends z.ZodTypeAny, B extends z.ZodTypeAny>(pipeline: z.ZodPipeline<A, B>) {
  return pipeline._def.out;
}

export function zodDefaultValue<T extends z.ZodTypeAny>(schema: z.ZodDefault<T>): z.infer<T> {
  return schema._def.defaultValue;
}

export function zodDefaultInnerType<T extends z.ZodTypeAny>(schema: z.ZodDefault<T>): T {
  return schema._def.innerType;
}

export function zodObjectFields<T extends z.AnyZodObject>(schema: T): Record<string, TypeInfo> {
  const r: Record<string, TypeInfo> = {};
  for (const field in schema.shape) {
    const fieldType = schema.shape[field];
    r[field] = getTypeInfo(fieldType);
  }
  return r;
}

export function zodTypeStr<T extends z.ZodTypeAny>(type: T): string {
  return type._def.typeName;
}

export function zodArrayElementType<T extends z.ZodTypeAny>(array: z.ZodArray<T>): TypeInfo {
  return getTypeInfo(array.element);
}

export function zodArrayMinLength<T extends z.ZodTypeAny>(array: z.ZodArray<T>): number | undefined {
  return array._def.minLength === null ? undefined : array._def.minLength.value;
}

export function zodArrayMaxLength<T extends z.ZodTypeAny>(array: z.ZodArray<T>): number | undefined {
  return array._def.maxLength === null ? undefined : array._def.maxLength.value;
}

export function zodStringChecks(zstr: z.ZodString): z.ZodStringCheck[] {
  return zstr._def.checks;
}

export function overwriteDescription<T extends z.ZodTypeAny>(typeInfo: TypeInfo, schema: T): TypeInfo {
  const { title, description } = extractZodDescription(schema);
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

export function getTypeInfo<T extends z.ZodTypeAny>(schema: T): TypeInfo {
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
        fields: zodObjectFields(schema as z.infer<T>),
        ...extractZodDescription(schema)
      };
      return r;
    }
    case 'ZodArray': {
      const r: ArrayTypeInfo = {
        typeName: 'array',
        schema,
        elementType: zodArrayElementType(schema as z.infer<T>),
        min: zodArrayMinLength(schema as z.infer<T>),
        max: zodArrayMaxLength(schema as z.infer<T>),
        ...extractZodDescription(schema)
      };
      return r;
    }
    case 'ZodNumber':
      return { typeName: 'number', schema, ...extractZodDescription(schema) }
    case 'ZodBigInt':
      return { typeName: 'bigint', schema, ...extractZodDescription(schema) };
    case 'ZodString': {
      const r: StringTypeInfo = {
        typeName: 'string',
        schema,
        checks: zodStringChecks(schema as z.infer<T>),
        ...extractZodDescription(schema)
      };
      return r;
    }
    case 'ZodBoolean':
      return { typeName: 'boolean', schema, ...extractZodDescription(schema) };
    default:
      throw new Error(`Unknown type: ${typeStr}`);
  }
}
