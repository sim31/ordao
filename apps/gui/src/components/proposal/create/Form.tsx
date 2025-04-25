import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assertUnreachable } from '@ordao/ts-utils';

const primitiveTypeNames = ['number', 'bigint', 'string', 'boolean'] as const;
type PrimitiveTypeName = typeof primitiveTypeNames[number];
type ObjectTypeName = 'object';
type ArrayTypeName = 'array';
type TypeName = PrimitiveTypeName | ObjectTypeName | ArrayTypeName;
interface TypeInfo {
  typeName: TypeName,
  schema: z.ZodSchema
}
interface PrimitiveTypeInfo extends TypeInfo {
  typeName: PrimitiveTypeName
}
interface ObjectTypeInfo extends TypeInfo {
  typeName: ObjectTypeName
  fields: Record<string, TypeInfo>
}
interface ArrayTypeInfo extends TypeInfo {
  typeName: ArrayTypeName
  elementType: TypeInfo
  min?: number,
  max?: number
}

function isPrimitive(typeInfo: TypeInfo): typeInfo is PrimitiveTypeInfo {
  return primitiveTypeNames.find(tn => tn === typeInfo.typeName) !== undefined;
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

function getTypeInfo<T extends z.ZodTypeAny>(schema: T): TypeInfo {
  const typeStr = zodTypeStr(schema);
  switch (typeStr) {
    case 'ZodEffects':
      return getTypeInfo(zodEffectInnerType(schema as z.infer<T>));
    case 'ZodOptional':
      return getTypeInfo(zodOptionalInnerType(schema as z.infer<T>));
    case 'ZodPipeline':
      return getTypeInfo(zodPipelineInnerType(schema as z.infer<T>));
    case 'ZodObject': {
      const r: ObjectTypeInfo = {
        typeName: 'object',
        schema,
        fields: objectFields(schema as z.infer<T>)
      };
      return r;
    }
    case 'ZodArray': {
      const r: ArrayTypeInfo = {
        typeName: 'array',
        schema,
        elementType: arrayElementType(schema as z.infer<T>),
        min: zodArrayMinLength(schema as z.infer<T>),
        max: zodArrayMaxLength(schema as z.infer<T>)
      };
      return r;
    }
    case 'ZodNumber':
      return { typeName: 'number', schema }
    case 'ZodBigInt':
      return { typeName: 'bigint', schema };
    case 'ZodString':
      return { typeName: 'string', schema }
    case 'ZodBoolean':
      return { typeName: 'boolean', schema }
    default:
      throw new Error(`Unknown type: ${typeStr}`);
  }
}

interface FormProps<T extends z.AnyZodObject> {
  schema: T
  onSubmit: (data: z.infer<T>) => void;
}

function Form<T extends z.AnyZodObject>({ schema, onSubmit }: FormProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit"
  });

  const fields = objectFields(schema);


  const renderPrimitiveField = (fieldName: string, typeInfo: PrimitiveTypeInfo) => {
    console.log("Rendering primitive field", fieldName, typeInfo);
    switch (typeInfo.typeName) {
      case 'string':
        return <input type="text" {...register(fieldName)} />;
      case 'number':
      case 'bigint':
        return <input type="number" {...register(fieldName)} />;
      case 'boolean':
        return <input type="checkbox" {...register(fieldName)} />;
      default:
        assertUnreachable(typeInfo.typeName);
    }
  }

  const renderField = (fieldName: string, typeInfo: TypeInfo) => {
    if (isPrimitive(typeInfo)) {
      return renderPrimitiveField(fieldName, typeInfo);
    } else if (typeInfo.typeName === 'object') {
      return <div>TODO: 'object'</div>
    } else if (typeInfo.typeName === 'array') {
      return <div>TODO: 'array'</div>
    } else {
      // assertUnreachable(typeInfo.typeName);
    }
  };

  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      {Object.entries(fields).map(([fieldName, typeInfo]) => (
        <div key={fieldName}>
          <label>{fieldName}</label>
          {renderField(fieldName, typeInfo)}
          {errors[fieldName]?.message && <div>{errors[fieldName].message.toString()}</div>}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

export default Form;