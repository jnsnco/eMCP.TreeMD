import { z } from "zod";

export function zodToString(schema: z.ZodTypeAny): string {
  // Unwrap refinements/transforms/etc.
  if (schema instanceof z.ZodEffects) {
    return zodToString(schema.innerType());
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodToString(schema.unwrap())} | undefined`;
  }
  if (schema instanceof z.ZodNullable) {
    return `${zodToString(schema.unwrap())} | null`;
  }

  if (schema instanceof z.ZodString) return "string";
  if (schema instanceof z.ZodNumber) return "number";
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodBigInt) return "bigint";
  if (schema instanceof z.ZodDate) return "Date";
  if (schema instanceof z.ZodUndefined) return "undefined";
  if (schema instanceof z.ZodNull) return "null";
  if (schema instanceof z.ZodAny) return "any";
  if (schema instanceof z.ZodUnknown) return "unknown";
  if (schema instanceof z.ZodNever) return "never";

  if (schema instanceof z.ZodLiteral) {
    const v = schema._def.value;
    return typeof v === "string" ? `"${v}"` : String(v);
  }

  if (schema instanceof z.ZodEnum) {
    return schema._def.values.map((v: any) => `"${v}"`).join(" | ");
  }

  if (schema instanceof z.ZodNativeEnum) {
    const vals = Object.values(schema._def.values).filter(v => typeof v === "string");
    return vals.map(v => `"${v}"`).join(" | ");
  }

  if (schema instanceof z.ZodUnion) {
    return schema._def.options.map(zodToString).join(" | ");
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    return schema._def.options.map(zodToString).join(" | ");
  }

  if (schema instanceof z.ZodArray) {
    return `${zodToString(schema.element)}[]`;
  }

  if (schema instanceof z.ZodTuple) {
    return `[${schema._def.items.map(zodToString).join(", ")}]`;
  }

  if (schema instanceof z.ZodRecord) {
    const key = schema.keySchema ? zodToString(schema.keySchema) : "string";
    const val = schema.valueSchema ? zodToString(schema.valueSchema) : "unknown";
    return `Record<${key}, ${val}>`;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const entries = Object.entries(shape).map(([k, v]) => `${k}: ${zodToString(v as z.ZodTypeAny)}`);
    // handle catchall (index signature) if present
    const catchall = schema._def.catchall;
    if (!(catchall instanceof z.ZodNever)) {
      entries.push(`[k: string]: ${zodToString(catchall)}`);
    }
    return `{ ${entries.join(", ")} }`;
  }

  return "unknown";
}
