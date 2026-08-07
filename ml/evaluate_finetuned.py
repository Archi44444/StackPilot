import argparse
import os
import json
import torch
import math
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate fine-tuned model on held-out test data.")
    parser.add_argument("--hf-repo", type=str, default=None, help="Hugging Face repo id to evaluate")
    parser.add_argument("--local-adapter", type=str, default="models/fine_tuned", help="Local LoRA adapter path")
    return parser.parse_args()

def load_jsonl(filepath):
    data = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line.strip()))
    return data

def main():
    args = parse_args()
    print("Loading evaluation dataset...")
    eval_data = load_jsonl("data/eval_qa.jsonl")
    
    model_id = "Qwen/Qwen2.5-0.5B-Instruct"
    
    if args.hf_repo:
        print(f"Loading model from Hugging Face: {args.hf_repo}...")
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
        if os.path.exists(args.local_adapter):
            print(f"Loading model with local adapter from {args.local_adapter}...")
            tokenizer = AutoTokenizer.from_pretrained(args.local_adapter, trust_remote_code=True)
            base_model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float32,
                device_map="auto"
            )
            model = PeftModel.from_pretrained(base_model, args.local_adapter)
        else:
            print("Using base model Qwen2.5-0.5B-Instruct for evaluation...")
            tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float32,
                device_map="auto"
            )
            
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    total_loss = 0.0
    total_tokens = 0
    results = []
    
    print("\nRunning evaluation...")
    for idx, item in enumerate(eval_data):
        inst = item["instruction"]
        inp = item.get("input", "")
        out = item["output"]
        
        prompt = f"<|im_start|>system\nYou are a helpful developer assistant.<|im_end|>\n<|im_start|>user\n{inst}"
        if inp.strip():
            prompt += f"\nInput:\n{inp}"
        prompt += f"<|im_end|>\n<|im_start|>assistant\n{out}<|im_end|>"
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        labels = inputs.input_ids.clone()
        
        # Calculate token loss
        with torch.no_grad():
            outputs = model(**inputs, labels=labels)
            loss = outputs.loss.item()
            num_tokens = inputs.input_ids.size(1)
            total_loss += loss * num_tokens
            total_tokens += num_tokens
            
        # Qualitative inference generation check
        test_prompt = f"<|im_start|>system\nYou are a helpful developer assistant.<|im_end|>\n<|im_start|>user\n{inst}"
        if inp.strip():
            test_prompt += f"\nInput:\n{inp}"
        test_prompt += f"<|im_end|>\n<|im_start|>assistant\n"
        
        test_inputs = tokenizer(test_prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            gen_outputs = model.generate(
                **test_inputs,
                max_new_tokens=128,
                temperature=0.3,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
        gen_ids = gen_outputs[0][test_inputs.input_ids.size(1):]
        generated_text = tokenizer.decode(gen_ids, skip_special_tokens=True).strip()
        
        print(f"\nExample {idx + 1}: {inst}")
        print(f"Target Output: {out[:120]}...")
        print(f"Generated Output: {generated_text[:120]}...")
        print(f"Loss: {loss:.4f}")
        
        results.append({
            "instruction": inst,
            "target": out,
            "generated": generated_text,
            "loss": loss
        })
        
    avg_loss = total_loss / total_tokens if total_tokens > 0 else 0.0
    perplexity = math.exp(avg_loss) if avg_loss < 100 else float('inf')
    
    print("\n" + "="*50)
    print(f"Evaluation Complete!")
    print(f"Average Loss: {avg_loss:.4f}")
    print(f"Perplexity: {perplexity:.4f}")
    print("="*50)
    
    os.makedirs("results", exist_ok=True)
    with open("results/eval_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "average_loss": avg_loss,
            "perplexity": perplexity,
            "examples": results
        }, f, indent=2)
    print("Saved evaluation results to results/eval_results.json")

if __name__ == "__main__":
    main()
