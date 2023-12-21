# from transformers import AutoTokenizer, AutoModelForCausalLM
# import transformers
# import torch

# model = 'meta-llama/Llama-2-7b-chat-hf'

# tokenizer = AutoTokenizer.from_pretrained(model, token=True)

# llama_pipeline = transformers.pipeline(
#     "text-generation",
#     model=model,
#     torch_dtype=torch.bfloat16,
#     device_map="auto"
# )


# response = llama_pipeline(
#     'hello how are you?',
#     do_sample=True,
#     top_k=10,
#     num_return_sequences=1,
#     max_length=4096
# )

# print(response)
