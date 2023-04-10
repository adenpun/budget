export function Omit<T extends object, U extends string>(object: T, property: U): Omit<T, U> {
    const { [property]: omited, ...rest } = object;
    return rest;
}

export function FilterKeys<T extends object>(
    object: T,
    predicate: (value: keyof T, object: T) => boolean
): Partial<T> {
    return Object.keys(object)
        .filter((key) => predicate(key as keyof T, object))
        .reduce((p, c) => (((p as any)[c] = (object as any)[c]), p), {});
}
