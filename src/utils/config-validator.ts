import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";

export const Types = t;

declare module "io-ts" {
    export function optional<RT extends t.Any>(
        type: RT,
        name?: string
    ): t.UnionType<
        [RT, t.UndefinedType],
        t.TypeOf<RT> | undefined,
        t.OutputOf<RT> | undefined,
        t.InputOf<RT> | undefined
    >;
}

function errorPath(err: t.ValidationError): string {
    const raw = err.context
        .map((c) => c.key)
        .filter(Boolean)
        .join(".");

    return raw.replace(/\.\d+\./g, ".").replace(/\.\d+$/g, "");
}

// Filter out errors that are just artifacts of union types with undefined
function isUnionNoise(err: t.ValidationError): boolean {
    const expected = err.context[err.context.length - 1]?.type?.name;

    return expected === "undefined" && err.value !== undefined;
}

// Format validation errors into human-readable strings
function formatValidationErrors(errors: t.ValidationError[]): string[] {
    const filtered = errors.filter((e) => !isUnionNoise(e));

    return filtered.map((err) => {
        const path = errorPath(err);
        const expected = err.context[err.context.length - 1]?.type?.name;
        const actual = JSON.stringify(err.value);
        return `Field "${path}": expected ${expected}, got ${actual}`;
    });
}


// ConfigValidator class to validate configuration objects against io-ts schemas
export class ConfigValidator {
    /**
     * Validate config object.
     */
    static validateConfig(
        config: any,
        schema: t.TypeC<any>
    ) {
        const result = t.exact(schema).decode(config);

        if (isLeft(result)) {
            const errors = formatValidationErrors(result.left);

            console.error("Config validation failed:");
            errors.forEach((e) => console.error("  - " + e));

            process.exit(1);
        }

        return result.right;
    }
}
