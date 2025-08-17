
migrate-up:
	bunx prisma migrate deploy

create-migration:
	bunx prisma migrate dev --name $(name)

IMAGE_TAG = zuramai/devoffer:$(TAG)
LATEST_TAG = zuramai/devoffer:latest
release:
	docker build -t $(IMAGE_TAG) .
	docker tag $(IMAGE_TAG) $(LATEST_TAG)
	docker push $(IMAGE_TAG)
	docker push $(LATEST_TAG)

.PHONY: create-migration migrate-up release