import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ModalEmbedCodeProps = {
  open: boolean;
  onClose: () => void;
  code: string
};

const ModalEmbedCode = ({ open, onClose, code }: ModalEmbedCodeProps) => {


  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  useEffect(() => {
    // Bloquea scroll background cuando modal está abierto
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose() }}>
      <DialogTitle className="sr-only"></DialogTitle>
      <DialogDescription className="sr-only">Esta es una vista del código HTML para embeber en web externa</DialogDescription>
      <DialogContent className=" bg-black/90 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-start mb-2">
          <button
            onClick={handleCopy}
            className={`
              text-white text-xs px-3 py-1 rounded-md transition-colors duration-300
              ${copied ? "bg-secondary hover:bg-secondary/80 text-foreground" : "bg-primary hover:bg-primary/50"}
            `}
          >
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        </div>
        <div className="p-6 text-white text-sm">
          <pre className="bg-gray-900 text-accent p-4 rounded-md overflow-auto whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEmbedCode;
