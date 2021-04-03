// Type definitions for better-sqlite3 3.1
// Project: http://github.com/JoshuaWise/better-sqlite3
// Definitions by: Ben Davies <https://github.com/Morfent>
//                 Mathew Rumsey <https://github.com/matrumz>
// Definitions updated by: Hawkings <https://github.com/Hawkings>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'better-sqlite3' {
	import Integer = require('integer');
	namespace DatabaseConstructor {
		interface RunResult {
			changes: number;
			lastInsertROWID: Integer.IntLike;
		}

		export class Statement<Params extends unknown[], Row> {
			database: Database;
			source: string;
			returnsData: boolean;
			constructor(db: Database, sources: string[]);

			run(...params: Params): RunResult;
			get(...params: Params): Row;
			all(...params: Params): Row[];
			each(params: any, cb: (row: any) => void): void;
			each(cb: (row: any) => void): void;
			each(...params: Params): void;
			pluck(toggleState?: boolean): this;
			bind(...params: Params): this;
			safeIntegers(toggleState?: boolean): this;
		}

		class Transaction {
			database: Database;
			source: string;
			constructor(db: Database, sources: string[]);

			run(...params: any[]): RunResult;
			bind(...params: any[]): this;
			safeIntegers(toggleState?: boolean): this;
		}

		interface DatabaseOptions {
			memory?: boolean;
			readonly?: boolean;
			fileMustExist?: boolean;
		}

		interface RegistrationOptions {
			name?: string;
			varargs?: boolean;
			deterministic?: boolean;
			safeIntegers?: boolean;
		}

		interface Database {
			memory: boolean;
			readonly: boolean;
			name: string;
			open: boolean;
			inTransaction: boolean;

			prepare<Params extends unknown[], Row>(source: string): Statement<Params, Row>;
			transaction(sources: string[]): Transaction;
			exec(source: string): this;
			pragma(source: string, simplify?: boolean): any;
			checkpoint(databaseName?: string): this;
			register(cb: (...params: any[]) => any): this;
			register(options: RegistrationOptions, cb: (...params: any[]) => any): this;
			close(): this;
			defaultSafeIntegers(toggleState?: boolean): this;
		}

		class SqliteError implements Error {
			name: string;
			message: string;
			code: string;
			constructor(message: string, code: string);
		}

		interface DatabaseConstructor {
			new (filename: string, options?: DatabaseOptions): Database;
			(filename: string, options?: DatabaseOptions): Database;
			prototype: Database;

			Integer: typeof Integer;
			SqliteError: typeof SqliteError;
		}
		const Database: DatabaseConstructor;
	}

	export = DatabaseConstructor.Database;
}
