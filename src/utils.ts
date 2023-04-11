import { Month } from "../dist";

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

export function SortMonth(list: Month[], oldest?: boolean) {
    let sorted;
    if (oldest) {
        sorted = list.sort((a, b) => {
            let a1 = a.split("-").map((v) => parseInt(v));
            let b1 = b.split("-").map((v) => parseInt(v));
            if (a1[0] < b1[0]) return -1;
            if (a1[0] > b1[0]) return 1;
            if (a1[0] === b1[0]) return a1[1] - b1[1];
            return 0;
        });
    } else {
        sorted = list.sort((a, b) => {
            let a1 = a.split("-").map((v) => parseInt(v));
            let b1 = b.split("-").map((v) => parseInt(v));
            if (a1[0] < b1[0]) return 1;
            if (a1[0] > b1[0]) return -1;
            if (a1[0] === b1[0]) return b1[1] - a1[1];
            return 0;
        });
    }
    return sorted;
}

export function GetLatestMonth(list: Month[]) {
    const sorted = SortMonth(list);

    return sorted[0];
}

export function GetClosestLastMonth(list: Month[], month: Month): Month {
    const newList = structuredClone(list);
    if (list.includes(month)) return month;
    newList.push(month);
    const sorted = SortMonth(newList);
    return sorted[sorted.indexOf(month) + 1];
}
