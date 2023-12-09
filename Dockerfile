FROM oven/bun

WORKDIR /usr/src/app

# Update default packages
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y \
        clang \
        llvm \
        make \
        git \
        curl

# Update new packages
RUN apt-get update


COPY package*.json bun.lockb ./
RUN bun install





COPY . .


CMD [ "bun", "run", "dev" ]