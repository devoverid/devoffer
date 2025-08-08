
migrate-up:
	bunx prisma migrate deploy

create-migration:
	bunx prisma migrate dev --name $1

.PHONY: create-migration migrate-up	