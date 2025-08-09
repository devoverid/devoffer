
migrate-up:
	bunx prisma migrate deploy

create-migration:
	bunx prisma migrate dev --name $(name)

.PHONY: create-migration migrate-up	