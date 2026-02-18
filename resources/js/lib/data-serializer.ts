import superjson from "superjson"
import z from "zod"

export const dataSerializer = <T>(data: T): T => {
  if (typeof window === "undefined") {
    return data
  }

  const serializedData = superjson.serialize(data)
  return superjson.deserialize(serializedData) as T
}

export function deserialize<T extends z.ZodObject>(schema: T) {
  const castToSchema = z.preprocess((val) => {
    if (typeof val !== "string") return val
    return val
      .trim()
      .split(" ")
      .reduce(
        (prev, curr) => {
          const [name, value] = curr.split(":")
          if (!value || !name) return prev
          prev[name] = value
          return prev
        },
        {} as Record<string, unknown>,
      )
  }, schema)
  return (value: string) => castToSchema.safeParse(value)
}
