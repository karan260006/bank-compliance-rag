import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

class ComplianceRAG:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )

    def process_pdf(self, file_path):
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        chunks = self.text_splitter.split_documents(pages)
        
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        else:
            self.vector_store.add_documents(chunks)
        
        return len(chunks)

    def ask(self, query):
        if not self.vector_store:
            return "Please upload some RBI guidelines or bank documents first."

        template = """
You are a Senior Bank Compliance Officer in India. 
Use the provided context (which contains RBI Master Circulars or Bank Guidelines) to answer the question.
Provide clear, authoritative answers. Cite specific clauses or sections if available in the context.
If you don't know the answer based on the context, say so, but offer to help find it in official RBI portals.

Context: {context}
Question: {question}

Compliance Response:"""

        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 5}),
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

        result = qa_chain.invoke({"query": query})
        
        sources = []
        for doc in result["source_documents"]:
            sources.append({
                "content": doc.page_content[:200] + "...",
                "page": doc.metadata.get("page", "N/A")
            })

        return {
            "answer": result["result"],
            "sources": sources
        }
