"""
StackPilot Developer Assistant — Gradio Inference Space
Deployed on Hugging Face Spaces (Gradio SDK — FREE)

The Gradio app exposes two endpoints automatically:
  POST /api/predict          — {"data": ["<question>", "<context>"]}
  GET  /                     — Web UI (for manual testing)

The Node backend calls /api/predict in production via the gradio_client
compatible REST interface.
"""

import os
import logging
import torch
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stackpilot-inference")

# ── Config ────────────────────────────────────────────────────────────────────
HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "Qwen/Qwen2.5-0.5B-Instruct")
HF_TOKEN = os.environ.get("HF_TOKEN", None)
MAX_NEW_TOKENS = int(os.environ.get("MAX_NEW_TOKENS", "128"))

# ── Load model once at startup ────────────────────────────────────────────────
logger.info(f"Loading model: {HF_MODEL_REPO}")
kwargs = {"trust_remote_code": True}
if HF_TOKEN:
    kwargs["token"] = HF_TOKEN

tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_REPO, **kwargs)
model = AutoModelForCausalLM.from_pretrained(
    HF_MODEL_REPO,
    dtype=torch.float32,
    low_cpu_mem_usage=True,
    **kwargs
)
model.eval()

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

logger.info("Model loaded successfully.")


# ── Inference function ────────────────────────────────────────────────────────
def generate(question: str, context: str = "") -> str:
    """Generate an answer to a developer question, optionally grounded in context."""
    prompt = (
        "<|im_start|>system\n"
        "You are a helpful developer assistant specialized in code explanation and technical questions."
    )
    if context.strip():
        prompt += f"\n\nContext from the user's codebase:\n{context.strip()}"
    prompt += f"<|im_end|>\n<|im_start|>user\n{question}<|im_end|>\n<|im_start|>assistant\n"

    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=0.3,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    generated_ids = outputs[0][inputs.input_ids.shape[-1]:]
    answer = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()
    return answer


# ── Gradio Interface ──────────────────────────────────────────────────────────
# Using gr.Interface creates a clean web UI AND automatically exposes
# a REST API at POST /api/predict — no extra setup needed.
demo = gr.Interface(
    fn=generate,
    inputs=[
        gr.Textbox(label="Question", placeholder="What is a closure in JavaScript?", lines=3),
        gr.Textbox(label="Context (optional — RAG chunks from codebase)", lines=5),
    ],
    outputs=gr.Textbox(label="Answer", lines=8),
    title="StackPilot Developer Assistant",
    description=(
        "Fine-tuned Qwen2.5-0.5B model for developer Q&A. "
        "This Space also exposes a REST API used by the StackPilot backend in production."
    ),
    examples=[
        ["What is a closure in JavaScript?", ""],
        ["Explain async/await with an example.", ""],
        ["What does this function do?", "function debounce(fn, delay) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }"],
    ],
    allow_flagging="never",
)

if __name__ == "__main__":
    demo.launch()
