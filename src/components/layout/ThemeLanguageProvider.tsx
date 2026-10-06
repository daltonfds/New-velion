"use client";

import { useEffect, useState } from "react";

const translations: Record<string, string> = {
  "Marketplace":"Mercado",
  "Suppliers":"Fornecedores",
  "My account":"Minha conta",
  "Cart":"Carrinho",
  "Sign in":"Entrar",
  "Create account":"Criar conta",
  "Start selling":"Começar a vender",
  "NewVelion Marketplace":"Mercado NewVelion",
  "Discover products from verified suppliers.":"Descubra produtos de fornecedores verificados.",
  "Search products, suppliers or categories...":"Pesquisar produtos, fornecedores ou categorias...",
  "All categories":"Todas as categorias",
  "All suppliers":"Todos os fornecedores",
  "Clear":"Limpar",
  "Featured":"Em destaque",
  "New arrivals":"Novidades",
  "Featured products":"Produtos em destaque",
  "All products":"Todos os produtos",
  "Best deals right now":"Melhores ofertas agora",
  "Limited offers":"Ofertas limitadas",
  "Just added":"Recém-adicionados",
  "Meet our suppliers":"Conheça nossos fornecedores",
  "View all suppliers →":"Ver todos os fornecedores →",
  "View profile →":"Ver perfil →",
  "Verified supplier":"Fornecedor verificado",
  "Supplier network":"Rede de fornecedores",
  "Find a supplier":"Encontrar fornecedor",
  "For sellers":"Para vendedores",
  "For customers":"Para clientes",
  "Start selling":"Começar a vender",
  "Create your account":"Criar sua conta",
  "Add to cart":"Adicionar ao carrinho",
  "ADD TO CART":"ADICIONAR AO CARRINHO",
  "VIEW":"VER",
  "OUT OF STOCK":"ESGOTADO",
  "ADDING...":"A ADICIONAR...",
  "Sold by":"Vendido por",
  "No products match your filters.":"Nenhum produto corresponde aos seus filtros.",
  "Loading...":"A carregar...",
  "products":"produtos",
  "results":"resultados",
  "Commerce infrastructure":"Infraestrutura de comércio",
  "Support":"Suporte",
  "Terms":"Termos",
  "Privacy":"Privacidade",
  "Dashboard":"Painel",
  "Settings":"Definições",
  "Profile":"Perfil",
  "Products":"Produtos",
  "Orders":"Pedidos",
  "Sales":"Vendas",
  "Customers":"Clientes",
  "Withdrawals":"Levantamentos",
  "Commissions":"Comissões",
  "Analytics":"Análises",
  "Reports":"Relatórios",
  "Notifications":"Notificações",
  "Search":"Pesquisar",
  "Save":"Guardar",
  "Cancel":"Cancelar",
  "Delete":"Eliminar",
  "Edit":"Editar",
  "Add":"Adicionar",
  "Back":"Voltar",
  "Next":"Seguinte",
  "Previous":"Anterior",
  "Submit":"Enviar",
  "Confirm":"Confirmar",
  "Status":"Estado",
  "Active":"Ativo",
  "Pending":"Pendente",
  "Approved":"Aprovado",
  "Rejected":"Rejeitado",
  "Total":"Total",
  "Price":"Preço",
  "Quantity":"Quantidade",
  "Description":"Descrição",
  "Name":"Nome",
  "Email":"E-mail",
  "Phone":"Telefone",
  "Country":"País",
  "Company":"Empresa",
  "Address":"Morada",
  "Payment":"Pagamento",
  "Checkout":"Finalizar compra",
  "Secure checkout":"Checkout seguro",
  "Order":"Pedido",
  "Order details":"Detalhes do pedido",
  "Track order":"Rastrear pedido",
  "Sign out":"Sair",
  "English":"Inglês",
  "Portuguese":"Português",
};

function translatePage(toPortuguese: boolean) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|CODE|PRE)$/i.test(parent.tagName)) continue;
    nodes.push(node as Text);
  }
  for (const text of nodes) {
    const original = text.textContent ?? "";
    if (!original.trim()) continue;
    const key = original.trim();
    const translated = translations[key];
    if (toPortuguese && translated) text.textContent = original.replace(key, translated);
    else if (!toPortuguese) {
      const english = Object.entries(translations).find(([, pt]) => pt === key)?.[0];
      if (english) text.textContent = original.replace(key, english);
    }
  }
}

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [pt, setPt] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("newvelion-theme");
    const storedLanguage = localStorage.getItem("newvelion-language");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = storedTheme ? storedTheme === "dark" : prefersDark;
    const nextPt = storedLanguage ? storedLanguage === "pt" : true;
    setDark(nextDark);
    setPt(nextPt);
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.lang = nextPt ? "pt" : "en";

    const observer = new MutationObserver(() => translatePage(nextPt));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    translatePage(nextPt);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("newvelion-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.documentElement.lang = pt ? "pt" : "en";
    localStorage.setItem("newvelion-language", pt ? "pt" : "en");
    translatePage(pt);
  }, [pt]);

  return (
    <>
      {children}
      <div className="newvelion-preferences" aria-label="Preferências da plataforma">
        <button type="button" onClick={() => setPt(true)} className={pt ? "active" : ""}>PT</button>
        <button type="button" onClick={() => setPt(false)} className={!pt ? "active" : ""}>EN</button>
        <button type="button" onClick={() => setDark((v) => !v)} aria-label={dark ? "Usar modo claro" : "Usar modo escuro"}>
          {dark ? "☀" : "☾"}
        </button>
      </div>
    </>
  );
}
