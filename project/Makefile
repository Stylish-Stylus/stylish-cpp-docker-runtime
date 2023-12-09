STACK_SIZE=1024
CC=clang
LD=/home/atmegabuzz/.rustup/toolchains/nightly-x86_64-unknown-linux-gnu/lib/rustlib/x86_64-unknown-linux-gnu/bin/gcc-ld/wasm-ld
CFLAGS=-I../../include/ -Iinterface-gen/ --target=wasm32 -Os --no-standard-libraries -mbulk-memory -Wall -g
LDFLAGS=-O2 --no-entry --stack-first -z stack-size=$(STACK_SIZE) -Bstatic

OBJECTS=main.o

all: ./main.wasm

# Step 1: build c-files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Step 2: link
main_unstripped.wasm: $(OBJECTS)
	$(LD) $(LDFLAGS) $(OBJECTS) -o $@

# Step 3: strip symbols from wasm
main.wasm: main_unstripped.wasm
	wasm-strip -o $@ $<

# Step 4: check the wasm using cargo-stylus
# cargo stylus check --wasm-file-path ./main.wasm --endpoint $ENDPOINT --private-key=$PRIVATE_KEY

# Step 5: deploy the wasm using cargo-stylus
# cargo stylus check --wasm-file-path ./main.wasm --endpoint $ENDPOINT --private-key=$PRIVATE_KEY

clean:
	rm $(OBJECTS) main_unstripped.wasm main.wasm

.phony: all cargo-generate clean
