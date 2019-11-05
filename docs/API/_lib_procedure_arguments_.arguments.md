# Class: Arguments

**`abstract`** Base class for declaring procedure arguments.
Values will be assigned by the compiler.

**`example`** 
```typescript
export class AssignRoleArguments extends Arguments {
    stringArg: string;
    dateArg: Date;
    numberArg: number;
}
```