
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface LoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSuccess, onRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await login(formData.email, formData.password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo(a) de volta!",
      });
      onSuccess();
    }
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
            Mari AI
          </h2>
        </div>

        {/* Título e subtítulo */}
        <h3 className="text-[#171C16] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
          Oi sou a Mari AI
        </h3>
        <p className="text-mari-gray text-sm text-center px-4 pb-3 pt-1">
          Faça login para conversar com a Mari e ter uma experiência personalizada
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* Senha */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                name="password"
                type="password"
                placeholder="Senha"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#171C16] focus:outline-0 focus:ring-0 border-none bg-[#EBF2E9] focus:border-none h-14 placeholder:text-mari-primary-green p-4 text-base font-normal leading-normal"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>
        </form>

        {/* Link esqueceu a senha */}
        <p className="text-mari-primary-green text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer hover:text-[#171C16] transition-colors">
          Esqueceu a senha?
        </p>
      </div>

      {/* Botão de login e link de cadastro */}
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-mari-primary-green text-mari-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#171C16] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
            </span>
          </button>
        </div>
        
        {/* Link para cadastro */}
        <button
          onClick={onRegister}
          className="text-mari-primary-green text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline w-full hover:text-[#171C16] transition-colors"
        >
          Não tem uma conta? Cadastre-se
        </button>
        
        <div className="h-5 bg-mari-white"></div>
      </div>
    </div>
  );
};

export default LoginScreen;
