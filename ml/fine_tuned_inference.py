import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

def parse_args():
    parser = argparse.ArgumentParser(description="Run inference using the fine-tuned or base Qwen2.5-0.5B model.")
    parser.add_argument("--question", type=str, required=True, help="Developer question to ask")
    parser.add_argument("--context", type=str, default="", help="Optional grounding context (RAG chunks)")
    parser.add_argument("--hf-repo", type=str, default=None, help="Hugging Face repository name to download model from")
    parser.add_argument("--local-adapter", type=str, default="models/fine_tuned", help="Path to local LoRA adapter if loading locally")
    return parser.parse_args()

def main():
    args = parse_args()
    
    model_id = "Qwen/Qwen2.5-0.5B-Instruct"
    
    if args.hf_repo:
        print(f"Loading merged fine-tuned model from Hugging Face: {args.hf_repo}...")
        try:
            tokenizer = AutoTokenizer.from_pretrained(args.hf_repo, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                args.hf_repo,
                torch_dtype=torch.float32,
                device_map="auto"
            )
        except Exception as e:
            print(f"Failed to load from Hugging Face ({e}). Falling back to local/base model.")
            args.hf_repo = None
            
    if not args.hf_repo:
        import os
        if os.path.exists(args.local_adapter):
            print(f"Loading base model and local adapter from {args.local_adapter}...")
            tokenizer = AutoTokenizer.from_pretrained(args.local_adapter, trust_remote_code=True)
            base_model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float32,
                device_map="auto"
            )
            model = PeftModel.from_pretrained(base_model, args.local_adapter)
        else:
            print("No fine-tuned model or local adapter found. Using base model Qwen2.5-0.5B-Instruct...")
            tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float32,
                device_map="auto"
            )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Construct the instruction prompt following Qwen2.5's chat ML structure
    prompt = "<|im_start|>system\nYou are a helpful developer assistant."
    if args.context.strip():
        prompt += f" Use the grounding context below to answer the user's request accurately:\n{args.context}"
    prompt += f"<|im_end|>\n<|im_start|>user\n{args.question}<|im_end|>\n<|im_start|>assistant\n"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.3,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
        
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, outputs)
    ]
    response = tokenizer.decode(generated_ids[0], skip_special_tokens=True).strip()
    
    print("\n--- Response ---")
    print(response)
    print("----------------")

if __name__ == "__main__":
    main()
