cargo build --target wasm32-unknown-unknown --release

wasm-bindgen --out-dir ./pkg --target web ./target/wasm32-unknown-unknown/release/js13kgames.wasm 