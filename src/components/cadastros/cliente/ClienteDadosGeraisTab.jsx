import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";

export default function ClienteDadosGeraisTab({ formData, setFormData, regioes, colaboradores, representantes }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Pessoa *</Label>
          <Select value={formData.tipo || "Pessoa Física"} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Situação *</Label>
          <Select value={formData.status || "Prospect"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione a situação..." />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="nome">Nome / Razão Social *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        {formData.tipo === "Pessoa Jurídica" && (
          <>
            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label>&nbsp;</Label>
              <BotaoBuscaAutomatica
                tipo="cnpj"
                valor={formData.cnpj}
                onDadosEncontrados={(dados) => {
                  setFormData(prev => ({
                    ...prev,
                    nome: dados.razao_social || prev.nome,
                    razao_social: dados.razao_social || "",
                    nome_fantasia: dados.nome_fantasia || "",
                    inscricao_estadual: dados.inscricao_estadual || prev.inscricao_estadual,
                    inscricao_municipal: dados.inscricao_municipal || prev.inscricao_municipal,
                    cnae_principal: dados.cnae_principal || prev.cnae_principal,
                    ramo_atividade: dados.cnae_principal || prev.ramo_atividade,
                    status_fiscal_receita: dados.situacao_cadastral || "Não Verificado",
                    porte_empresa: dados.porte || prev.porte_empresa,
                    endereco_principal: {
                      ...prev.endereco_principal,
                      cep: dados.endereco_completo?.cep || prev.endereco_principal.cep,
                      logradouro: dados.endereco_completo?.logradouro || prev.endereco_principal.logradouro,
                      numero: dados.endereco_completo?.numero || prev.endereco_principal.numero,
                      bairro: dados.endereco_completo?.bairro || prev.endereco_principal.bairro,
                      cidade: dados.endereco_completo?.cidade || prev.endereco_principal.cidade,
                      estado: dados.endereco_completo?.uf || prev.endereco_principal.estado,
                      complemento: dados.endereco_completo?.complemento || prev.endereco_principal.complemento
                    },
                    configuracao_fiscal: {
                      ...prev.configuracao_fiscal,
                      regime_tributario: dados.porte === 'MEI' ? 'MEI' : ['ME', 'EPP'].includes(dados.porte) ? 'Simples Nacional' : prev.configuracao_fiscal.regime_tributario
                    }
                  }));
                }}
                disabled={!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14}
              />
            </div>

            <div>
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <Input
                id="inscricao_estadual"
                value={formData.inscricao_estadual}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
              <Input
                id="inscricao_municipal"
                value={formData.inscricao_municipal}
                onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
              />
            </div>
          </>
        )}

        {formData.tipo === "Pessoa Física" && (
          <>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <Label>&nbsp;</Label>
              <BotaoBuscaAutomatica
                tipo="cpf"
                valor={formData.cpf}
                onDadosEncontrados={(dados) => {
                  if (dados.valido) {
                    setFormData({ ...formData, cpf: dados.formatado });
                  }
                }}
                disabled={!formData.cpf || formData.cpf.replace(/\D/g, '').length < 11}
              />
            </div>

            <div>
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="col-span-2 pt-4 border-t">
          <h3 className="font-semibold mb-3">Endereço Principal</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.endereco_principal?.cep || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, cep: e.target.value }
                })}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Label>&nbsp;</Label>
              <BotaoBuscaAutomatica
                tipo="cep"
                valor={formData.endereco_principal?.cep}
                onDadosEncontrados={(dados) => {
                  setFormData(prev => ({
                    ...prev,
                    endereco_principal: {
                      ...prev.endereco_principal,
                      logradouro: dados.logradouro || "",
                      bairro: dados.bairro || "",
                      cidade: dados.cidade || "",
                      estado: dados.uf || "",
                      latitude: dados.latitude || null,
                      longitude: dados.longitude || null,
                      mapa_url: dados.latitude && dados.longitude
                        ? `https://www.google.com/maps?q=${dados.latitude},${dados.longitude}`
                        : ""
                    }
                  }));
                }}
                disabled={!formData.endereco_principal?.cep || formData.endereco_principal.cep.replace(/\D/g, '').length < 8}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                value={formData.endereco_principal?.logradouro || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, logradouro: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.endereco_principal?.numero || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, numero: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.endereco_principal?.bairro || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, bairro: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.endereco_principal?.cidade || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, cidade: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="estado">UF</Label>
              <Input
                id="estado"
                value={formData.endereco_principal?.estado || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco_principal: { ...formData.endereco_principal, estado: e.target.value }
                })}
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="regiao_atendimento_id">Região de Atendimento</Label>
          <Select 
            value={formData.regiao_atendimento_id || ""} 
            onValueChange={(value) => {
              const regiao = regioes.find(r => r.id === value);
              setFormData({ 
                ...formData, 
                regiao_atendimento_id: value,
                regiao_atendimento_nome: regiao?.nome_regiao || ''
              });
            }}
          >
            <SelectTrigger id="regiao_atendimento_id">
              <SelectValue placeholder="Selecione a região" />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              {regioes.filter(r => r.ativo).map((regiao) => (
                <SelectItem key={regiao.id} value={regiao.id}>
                  {regiao.nome_regiao} {regiao.tipo_regiao && `(${regiao.tipo_regiao})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vendedor_responsavel_id">
            Vendedor Responsável
          </Label>
          <Select
            value={formData.vendedor_responsavel_id || ""}
            onValueChange={(value) => {
              const vendedor = colaboradores.find(c => c.id === value);
              setFormData({
                ...formData,
                vendedor_responsavel_id: value,
                vendedor_responsavel: vendedor?.nome_completo || ""
              });
            }}
          >
            <SelectTrigger id="vendedor_responsavel_id">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              {colaboradores.filter(c => c.departamento === 'Comercial').map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome_completo} - {c.cargo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="indicador_id">
            💰 Indicador (Comissão/Cashback)
          </Label>
          <Select
            value={formData.indicador_id || ""}
            onValueChange={(value) => {
              const indicador = representantes.find(r => r.id === value);
              setFormData({
                ...formData,
                indicador_id: value,
                indicador_nome: indicador?.nome || "",
                tipo_indicador: indicador?.tipo_representante || "",
                percentual_comissao_indicador: indicador?.percentual_comissao || 0
              });
            }}
          >
            <SelectTrigger id="indicador_id" className="w-full">
              <SelectValue placeholder="Quem indicou este cliente?" />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value={null}>
                <span className="text-slate-400">❌ Nenhum indicador</span>
              </SelectItem>
              {representantes.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  <span className="font-medium">{rep.nome}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(formData.status === 'Inativo' || formData.status === 'Bloqueado') && (
          <div className="col-span-2">
            <Label htmlFor="motivo_inatividade">Motivo de Inativação/Bloqueio *</Label>
            <Textarea
              id="motivo_inatividade"
              value={formData.motivo_inatividade}
              onChange={(e) => setFormData({ ...formData, motivo_inatividade: e.target.value })}
              rows={2}
              required
            />
          </div>
        )}

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações Internas</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}