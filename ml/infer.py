"""
infer.py — subprocess-friendly inference script for StackPilot.
Accepts --question and --context via CLI args.
Outputs a single JSON line to stdout: {"answer": "..."} or {"error": "..."}
"""

import sys
import json
import argparse
import os

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--question", type=str, required=True)
    parser.add_argument("--context", type=str, default="")
    return parser.parse_args()

def main():
    args = parse_args()

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        # Prefer the locally merged model; fall back to local adapter; then base.
        merged_path = os.path.join(os.path.dirname(__file__), "models", "merged")
        adapter_path = os.path.join(os.path.dirname(__file__), "models", "fine_tuned")
        base_model_id = "Qwen/Qwen2.5-0.5B-Instruct"

        if os.path.exists(merged_path):
            model_path = merged_path
            tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                model_path,
                dtype=torch.float32,
                low_cpu_mem_usage=True
            )
        elif os.path.exists(adapter_path):
            from peft import PeftModel
            tokenizer = AutoTokenizer.from_pretrained(adapter_path, trust_remote_code=True)
            base = AutoModelForCausalLM.from_pretrained(
                base_model_id,
                dtype=torch.float32,
                low_cpu_mem_usage=True
            )
            model = PeftModel.from_pretrained(base, adapter_path)
        else:
            tokenizer = AutoTokenizer.from_pretrained(base_model_id, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                base_model_id,
                dtype=torch.float32,
                low_cpu_mem_usage=True
            )

        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        prompt = "<|im_start|>system\nYou are a helpful developer assistant specialized in code explanation and technical questions."
        if args.context.strip():
            prompt += f"\n\nContext from the user's codebase:\n{args.context.strip()}"
        prompt += f"<|im_end|>\n<|im_start|>user\n{args.question}<|im_end|>\n<|im_start|>assistant\n"

        inputs = tokenizer(prompt, return_tensors="pt")

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=128,
                temperature=0.3,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )

        generated_ids = outputs[0][inputs.input_ids.shape[-1]:]
        response = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

        print(json.dumps({"answer": response}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
