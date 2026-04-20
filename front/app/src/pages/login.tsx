import { useMsal } from "@azure/msal-react";
import { FaArrowRightLong } from "react-icons/fa6";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { PiFilesFill, PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { loginRequest } from "../auth/authConfig";

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    console.log("CLICK LOGIN"); 
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  console.log("AZURE_CLIENT_ID:", import.meta.env.VITE_AZURE_CLIENT_ID);
  console.log("AZURE_TENANT_ID:", import.meta.env.VITE_AZURE_TENANT_ID);
  console.log("AZURE_REDIRECT_URI:", import.meta.env.VITE_REDIRECT_URI);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh relative overflow-hidden font-sans">
      {/* CAPA DE FONDO DINÁMICA */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white opacity-40" />
        {/* Orbes de luz con más intensidad para generar contraste */}
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* CARD: Glassmorphism de alto contraste */}
        <div className="relative group">
          {/* Brillo perimetral (Border Glow) */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-transparent rounded-[2.5rem] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000" />

          {/* Cuerpo de la tarjeta - Ahora más clara para separarse del fondo negro */}
          <div className="relative bg-[#111114] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-10 md:p-12 overflow-hidden">
            {/* Decoración superior: El icono de archivos como foco */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-6 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <PiFilesFill className="text-5xl text-white opacity-90" />
                </div>
              </div>
            </div>

            <div className="relative space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-white text-3xl font-black tracking-tight leading-none uppercase italic">
                  File<span className="text-indigo-500 text-4xl">.</span>Manager
                </h2>
                <div className="h-0.5 w-12 bg-indigo-600 mx-auto" />
                <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase">
                  Gestión Segura de Documentos
                </p>
              </div>

              {/* BOTÓN CTA - Iniciar sesión con Outlook */}
              <div className="relative group pt-4">
                {/* Glow sutil de fondo */}
                <div className="absolute -inset-px bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all duration-500" />

                <button
                  onClick={handleLogin}
                  className="relative w-full flex items-center justify-between bg-white hover:bg-zinc-50 text-zinc-900 font-semibold text-sm uppercase tracking-widest py-2 px-4 rounded-3xl shadow-xl shadow-black/10 transition-all duration-300 active:scale-[0.97] group-hover:shadow-2xl overflow-hidden"
                >
                  {/* Contenido izquierdo */}
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#0078D4] rounded-2xl">
                      <PiMicrosoftOutlookLogoFill className="text-white text-3xl" />
                    </div>

                    <div>
                      <div className="font-black text-base tracking-normal text-left leading-none">
                        Inicia sesión
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium -mt-0.5">
                        con Microsoft Outlook
                      </div>
                    </div>
                  </div>

                  {/* Flecha animada */}
                  <div className="text-2xl text-zinc-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-2">
                    <FaArrowRightLong />
                  </div>
                </button>
              </div>

              {/* FOOTER INTERNO */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-green-500">
                  <HiOutlineShieldCheck className="text-emerald-500 text-xl" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                    Acceso Corporativo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
