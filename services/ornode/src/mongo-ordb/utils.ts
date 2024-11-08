import { WithId } from "mongodb"
import { withoutProperty } from "@ordao/ts-utils"

export function withoutId<T>(doc: WithId<T>): Omit<WithId<T>, '_id'> {
  return withoutProperty(doc, '_id');  
}