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

RUN curl -O https://releases.llvm.org/13.0.0/binaries/wasm-ld-linux -L

# Get Rust
# RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN curl -sSf https://sh.rustup.rs | sh -s -- --default-toolchain stable -y
RUN apt-get update


RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc
ENV PATH="/root/.cargo/bin:${PATH}"


RUN rustup target add wasm32-unknown-unknown

RUN RUSTFLAGS="-C link-args=-rdynamic" cargo install --force cargo-stylus



# Update new packages
RUN apt-get update


COPY package*.json bun.lockb ./
RUN git clone https://github.com/OffchainLabs/stylus-sdk-c
RUN bun install


COPY . .


CMD [ "bun", "run", "dev" ]