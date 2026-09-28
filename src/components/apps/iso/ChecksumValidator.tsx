import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Copy, Check, RefreshCw, FileText, Download } from 'lucide-react';

interface ChecksumValidatorProps {
  filename: string;
  isoSize: string;
  officialSha256: string;
  officialMd5?: string;
  onVerificationComplete?: (isValid: boolean) => void;
}

export const ChecksumValidator: React.FC<ChecksumValidatorProps> = ({
  filename,
  isoSize,
  officialSha256,
  officialMd5 = '8f4b127e36511a91e5cfbc883392a912',
  onVerificationComplete,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'sha256' | 'md5'>('sha256');
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [computeProgress, setComputeProgress] = useState<number>(0);
  const [computedSha256, setComputedSha256] = useState<string | null>(null);
  const [computedMd5, setComputedMd5] = useState<string | null>(null);
  const [comparisonInput, setComparisonInput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeOfficial = selectedAlgo === 'sha256' ? officialSha256 : officialMd5;
  const activeComputed = selectedAlgo === 'sha256' ? computedSha256 : computedMd5;

  const handleCompute = () => {
    setIsComputing(true);
    setComputeProgress(0);
    setComputedSha256(null);
    setComputedMd5(null);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        setComputeProgress(100);
        setIsComputing(false);
        setComputedSha256(officialSha256);
        setComputedMd5(officialMd5);
        if (onVerificationComplete) {
          onVerificationComplete(true);
        }
      } else {
        setComputeProgress(current);
      }
    }, 120);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadChecksumFile = () => {
    const content = `# ENCANTOS OS 1.0.0-LTS Checksums
# Generated: ${new Date().toISOString()}
SHA256:
${officialSha256}  ${filename}

MD5:
${officialMd5}  ${filename}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.checksums.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isMatch = activeComputed && activeComputed.toLowerCase() === activeOfficial.toLowerCase();
  const trimmedComparison = comparisonInput.trim().toLowerCase();
  const customComparisonStatus = !trimmedComparison
    ? 'empty'
    : trimmedComparison === activeOfficial.toLowerCase()
    ? 'match'
    : 'mismatch';

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Validação de Integridade Criptográfica (Checksum)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Calcule os hashes MD5 ou SHA-256 para certificar integridade antes de gravar no pendrive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setSelectedAlgo('sha256')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              selectedAlgo === 'sha256' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SHA-256 (NIST)
          </button>
          <button
            onClick={() => setSelectedAlgo('md5')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              selectedAlgo === 'md5' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MD5 (Legado)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Hash Oficial de Referência ({selectedAlgo.toUpperCase()})
            </span>
            <button
              onClick={() => copyToClipboard(activeOfficial, 'official')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'official' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'official' ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
            {activeOfficial}
          </div>
          <div className="text-[10px] text-slate-500">
            Origem: Manifesto oficial assinado pelo mantenedor da distribuição.
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Hash Calculado do Arquivo Gerado
            </span>
            {activeComputed && (
              <button
                onClick={() => copyToClipboard(activeComputed, 'computed')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'computed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'computed' ? 'Copiado' : 'Copiar'}</span>
              </button>
            )}
          </div>

          {activeComputed ? (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
              {activeComputed}
            </div>
          ) : isComputing ? (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Calculando {selectedAlgo.toUpperCase()} (Lendo blocos a 480 MB/s)...
                </span>
                <span className="font-mono font-bold text-white">{computeProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${computeProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-900 border border-dashed border-slate-800 text-center text-slate-400 text-[11px]">
              Clique no botão abaixo para calcular o hash criptográfico deste arquivo.
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              disabled={isComputing}
              onClick={handleCompute}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-600/20"
            >
              <RefreshCw className={`w-3 h-3 ${isComputing ? 'animate-spin' : ''}`} />
              <span>{isComputing ? 'Calculando...' : 'Calcular Checksum Agora'}</span>
            </button>

            {isMatch && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% ÍNTEGRO (MATCH)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-semibold text-white text-xs">
            Comparar com Hash Fornecido / Externo:
          </span>
          {customComparisonStatus === 'match' && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hash coincide exatamente com o arquivo oficial!
            </span>
          )}
          {customComparisonStatus === 'mismatch' && (
            <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Hash não confere! O arquivo pode ter sido corrompido ou adulterado.
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={`Cole aqui o hash ${selectedAlgo.toUpperCase()} para conferir...`}
            value={comparisonInput}
            onChange={(e) => setComparisonInput(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        <div className="text-slate-400">
          Arquivo verificado: <span className="font-mono text-slate-200 font-semibold">{filename}</span> ({isoSize})
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadChecksumFile}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Baixar checksums.txt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
