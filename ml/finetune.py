import argparse
import os
import json
import torch
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
from peft import LoraConfig, get_peft_model, TaskType, PeftModel

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune Qwen2.5-0.5B on developer QA data using LoRA.")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=2, help="Training batch size")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--hf-repo", type=str, default=None, help="Hugging Face repository to push merged model (e.g. username/stackpilot-dev-assistant)")
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
    print("Loading dataset...")
    train_data = load_jsonl("data/developer_qa.jsonl")
    dataset = Dataset.from_list(train_data)
    
    model_id = "Qwen/Qwen2.5-0.5B-Instruct"
    print(f"Loading tokenizer and model: {model_id}...")
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float32

)
    
    # Configure LoRA
    lora_config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )
    
    print("Applying LoRA configuration...")
    peft_model = get_peft_model(model, lora_config)
    
    # Explicitly calculate and print the trainable parameter counts as requested
    trainable_params, all_params = peft_model.get_nb_trainable_parameters()
    percentage = (trainable_params / all_params) * 100
    print("-" * 50)
    print(f"Total parameters: {all_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    print(f"Trainable percentage: {percentage:.4f}%")
    print("-" * 50)
    
    def preprocess_function(examples):
        inputs = []
        for inst, inp, out in zip(examples["instruction"], examples["input"], examples["output"]):
            prompt = f"<|im_start|>system\nYou are a helpful developer assistant.<|im_end|>\n<|im_start|>user\n{inst}"
            if inp.strip():
                prompt += f"\nInput:\n{inp}"
            prompt += f"<|im_end|>\n<|im_start|>assistant\n{out}<|im_end|>"
            inputs.append(prompt)
            
        model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding=False)
        model_inputs["labels"] = model_inputs["input_ids"].copy()
        return model_inputs

    print("Preprocessing training dataset...")
    tokenized_dataset = dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    
    training_args = TrainingArguments(
        output_dir="models/checkpoints",
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.lr,
        logging_steps=5,
        save_strategy="no",
        weight_decay=0.01,
        fp16=False, # CPU friendly
        use_cpu=True,
        remove_unused_columns=False
    )
    
    trainer = Trainer(
        model=peft_model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt", padding=True)
    )
    
    print("Starting training...")
    trainer.train()
    
    adapter_dir = "models/fine_tuned"
    print(f"Saving LoRA adapter to {adapter_dir}...")
    peft_model.save_pretrained(adapter_dir)
    tokenizer.save_pretrained(adapter_dir)
    
    if args.hf_repo:
        print(f"Merging LoRA adapter back into base model...")
        # Reload base model cleanly for merging
        base_model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float32
    

        )
        merged_model = PeftModel.from_pretrained(base_model, adapter_dir)
        merged_model = merged_model.merge_and_unload()
        
        print(f"Pushing merged model to Hugging Face Hub: {args.hf_repo}...")
        merged_model.push_to_hub(args.hf_repo)
        tokenizer.push_to_hub(args.hf_repo)
        print("Model successfully pushed!")

if __name__ == "__main__":
    main()
