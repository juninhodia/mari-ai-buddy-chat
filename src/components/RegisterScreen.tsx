import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    birthDate: '',
    state: '',
    city: '',
    password: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptBeta, setAcceptBeta] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.phone || !formData.gender || !formData.birthDate || !formData.state || !formData.city || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Aceite os termos",
        description: "É necessário aceitar os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptBeta) {
      toast({
        title: "Aceite os termos da versão beta",
        description: "É necessário estar ciente de que esta é uma versão beta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register(formData);
      if (success) {
        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo(a) à Mari AI!",
        });
        onSuccess();
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível realizar o cadastro. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (00) 00000-0000
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-mari-white justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center bg-mari-white p-4 pb-2 justify-between">
          <button 
            onClick={onBack}
            className="text-[#171C16] flex size-12 shrink-0 items-center justify-center hover:bg-mari-very-light-green rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[#171C16] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Cadastro
          </h2>
        </div>

        {/* Texto explicativo */}
        <div className="px-4 py-2">
          <p className="text-mari-gray text-sm text-center">
            Crie sua conta para ter acesso completo à Mari AI e uma experiência personalizada
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome completo */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Nome completo</p>
              <input
                name="name"
                type="text"
                placeholder="Digite seu nome completo"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* Celular */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Celular</p>
              <input
                name="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </label>
          </div>

          {/* Gênero */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Gênero</p>
              <select
                name="gender"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro-nao-informar">Prefiro não informar</option>
              </select>
            </label>
          </div>

          {/* Data de nascimento */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Data de nascimento</p>
              <input
                name="birthDate"
                type="date"
                placeholder="Selecione sua data de nascimento"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* Estado */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Estado</p>
              <select
                name="state"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.state}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione seu estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </label>
          </div>

          {/* Cidade */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Cidade</p>
              <input
                name="city"
                type="text"
                placeholder="Digite sua cidade"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* Senha */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#171C16] text-base font-medium leading-normal pb-2">Senha</p>
              <input
                name="password"
                type="password"
                placeholder="Crie uma senha"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                required
              />
            </label>
          </div>
        </form>

        {/* Checkbox de aceite dos termos */}
        <div className="flex items-start gap-3 px-4 py-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-mari-primary-green bg-mari-very-light-green border-mari-light-green rounded focus:ring-mari-primary-green focus:ring-2"
          />
          <label htmlFor="acceptTerms" className="text-xs text-mari-gray leading-relaxed">
            Aceito que meus dados sejam utilizados para melhorar a experiência com a IA e personalizar as respostas de acordo com meu perfil.
          </label>
        </div>

        {/* Checkbox de aceite da versão beta */}
        <div className="flex items-start gap-3 px-4 py-3">
          <input
            type="checkbox"
            id="acceptBeta"
            checked={acceptBeta}
            onChange={(e) => setAcceptBeta(e.target.checked)}
            className="mt-1 w-4 h-4 text-mari-primary-green bg-mari-very-light-green border-mari-light-green rounded focus:ring-mari-primary-green focus:ring-2"
          />
          <label htmlFor="acceptBeta" className="text-xs text-mari-gray leading-relaxed">
            Estou ciente de que esta é uma versão <strong>BETA</strong> e que algumas mensagens podem estar incorretas ou imprecisas. Aceito utilizar o sistema com essa limitação.
          </label>
        </div>
      </div>

      {/* Botão de cadastrar */}
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !acceptTerms || !acceptBeta}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-mari-primary-green text-mari-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#171C16] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {isLoading ? 'CADASTRANDO...' : 'CADASTRAR'}
            </span>
          </button>
        </div>
        <div className="h-5 bg-mari-white"></div>
      </div>
    </div>
  );
};

export default RegisterScreen; 