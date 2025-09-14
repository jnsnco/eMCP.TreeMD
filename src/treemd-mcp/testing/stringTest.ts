import { zodToString } from "../utils/zodToString";
import { z } from "zod";

const schema = z.object({
    a: z.string(),
    b: z.string(),
    c: z.number(),
    d: z.boolean(),
    e: z.date(),
    f: z.bigint(),
    g: z.undefined(),
    h: z.null(),
    i: z.any(),
    j: z.unknown(),
    k: z.never(),
    l: z.literal("hello"),
    m: z.enum(["hello", "world"]),
  });
  
  console.log(zodToString(schema));