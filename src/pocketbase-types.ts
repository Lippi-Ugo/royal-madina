/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Boissons = "boissons",
	Commandes = "commandes",
	ItemsCommande = "items_commande",
	Pizzas = "pizzas",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum BoissonsTailleOptions {
	"33cl" = "33cl",
	"50cl" = "50cl",
	"1L" = "1L",
	"1.5L" = "1.5L",
}

export enum BoissonsTypeOptions {
	"soft" = "soft",
	"jus" = "jus",
	"eau" = "eau",
	"autre" = "autre",
}
export type BoissonsRecord = {
	created: IsoAutoDateString
	disponible?: boolean
	id: string
	image?: FileNameString
	nom?: string
	prix?: number
	taille?: BoissonsTailleOptions
	type?: BoissonsTypeOptions
	updated: IsoAutoDateString
}

export enum CommandesTypeCommandeOptions {
	"livraison" = "livraison",
	"emporter" = "emporter",
}

export enum CommandesStatutOptions {
	"en attente" = "en attente",
	"confirmée" = "confirmée",
	"en préparation" = "en préparation",
	"prête" = "prête",
	"en livraison" = "en livraison",
	"livrée" = "livrée",
	"annulée" = "annulée",
}

export enum CommandesPaymentStatusOptions {
	"pending" = "pending",
	"succeeded" = "succeeded",
	"failed" = "failed",
	"refunded" = "refunded",
}
export type CommandesRecord = {
	adresse_livraison?: string
	client_email?: string
	client_nom?: string
	client_telephone?: string
	created: IsoAutoDateString
	date_commande?: IsoDateString
	heure_souhaitee?: string
	id: string
	notes?: string
	numero_commande: string
	payment_status?: CommandesPaymentStatusOptions
	sms_envoye?: boolean
	statut?: CommandesStatutOptions
	stripe_session_id?: string
	stripe_session_intent?: string
	total?: number
	type_commande?: CommandesTypeCommandeOptions
	updated: IsoAutoDateString
	users_id?: RecordIdString
}

export type ItemsCommandeRecord = {
	commande?: RecordIdString
	created: IsoAutoDateString
	id: string
	prix_unitaire?: number
	produit_nom?: string
	quantite?: number
	updated: IsoAutoDateString
}

export type PizzasRecord = {
	created: IsoAutoDateString
	description?: string
	disponible?: boolean
	id: string
	image?: FileNameString
	nom?: string
	prix?: number
	updated: IsoAutoDateString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	nom?: string
	password: string
	prenom?: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BoissonsResponse<Texpand = unknown> = Required<BoissonsRecord> & BaseSystemFields<Texpand>
export type CommandesResponse<Texpand = unknown> = Required<CommandesRecord> & BaseSystemFields<Texpand>
export type ItemsCommandeResponse<Texpand = unknown> = Required<ItemsCommandeRecord> & BaseSystemFields<Texpand>
export type PizzasResponse<Texpand = unknown> = Required<PizzasRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	boissons: BoissonsRecord
	commandes: CommandesRecord
	items_commande: ItemsCommandeRecord
	pizzas: PizzasRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	boissons: BoissonsResponse
	commandes: CommandesResponse
	items_commande: ItemsCommandeResponse
	pizzas: PizzasResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
