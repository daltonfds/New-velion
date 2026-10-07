"use client";

import { useEffect, useState } from "react";

/**
 * Central UI dictionary.
 * English is the source language; Portuguese is opt-in and defaults to pt-PT.
 * The translator covers text nodes plus common form/accessibility attributes so
 * existing pages do not need a second routing or component architecture.
 */
const translations: Record<string, string> = {
  "Marketplace":"Mercado","Suppliers":"Fornecedores","My account":"Minha conta","Cart":"Carrinho",
  "Sign in":"Entrar","Sign up":"Registar","Create account":"Criar conta","Start selling":"Começar a vender",
  "NewVelion Marketplace":"Mercado NewVelion","Discover products from verified suppliers.":"Descubra produtos de fornecedores verificados.",
  "Search products, suppliers or categories...":"Pesquisar produtos, fornecedores ou categorias...","All categories":"Todas as categorias",
  "All suppliers":"Todos os fornecedores","Clear":"Limpar","Featured":"Em destaque","New arrivals":"Novidades",
  "Featured products":"Produtos em destaque","All products":"Todos os produtos","Best deals right now":"Melhores ofertas agora",
  "Limited offers":"Ofertas limitadas","Just added":"Recém-adicionados","Meet our suppliers":"Conheça os nossos fornecedores",
  "View all suppliers →":"Ver todos os fornecedores →","View profile →":"Ver perfil →","Verified supplier":"Fornecedor verificado",
  "Supplier network":"Rede de fornecedores","Find a supplier":"Encontrar fornecedor","For sellers":"Para vendedores",
  "For customers":"Para clientes","Create your account":"Crie a sua conta","Add to cart":"Adicionar ao carrinho",
  "ADD TO CART":"ADICIONAR AO CARRINHO","VIEW":"VER","OUT OF STOCK":"ESGOTADO","ADDING...":"A ADICIONAR...",
  "Sold by":"Vendido por","No products match your filters.":"Nenhum produto corresponde aos seus filtros.","Loading...":"A carregar...",
  "Commerce infrastructure":"Infraestrutura de comércio","Secure checkout":"Checkout seguro","Order details":"Detalhes do pedido",
  "Track order":"Rastrear pedido","Sign out":"Sair","Log out":"Sair","Log out?":"Sair?","Logging out...":"A sair...",
  "Profile & settings":"Perfil e definições","Account":"Conta","Platform":"Plataforma","Close menu":"Fechar menu","Open menu":"Abrir menu",
  "Dashboard":"Painel","Settings":"Definições","Profile":"Perfil","Products":"Produtos","Orders":"Pedidos","Sales":"Vendas",
  "Customers":"Clientes","Withdrawals":"Levantamentos","Commissions":"Comissões","Analytics":"Análises","Reports":"Relatórios",
  "Notifications":"Notificações","Search":"Pesquisar","Save":"Guardar","Cancel":"Cancelar","Delete":"Eliminar","Edit":"Editar",
  "Add":"Adicionar","Back":"Voltar","Next":"Seguinte","Previous":"Anterior","Submit":"Enviar","Confirm":"Confirmar",
  "Status":"Estado","Active":"Ativo","Inactive":"Inativo","Pending":"Pendente","Approved":"Aprovado","Rejected":"Rejeitado",
  "Draft":"Rascunho","Published":"Publicado","Disabled":"Desativado","Enabled":"Ativado","Total":"Total","Price":"Preço",
  "Cost":"Custo","Quantity":"Quantidade","Description":"Descrição","Name":"Nome","Email":"E-mail","Phone":"Telefone",
  "Country":"País","Company":"Empresa","Address":"Morada","City":"Cidade","State":"Província","Postal code":"Código postal",
  "Payment":"Pagamento","Checkout":"Finalizar compra","Order":"Pedido","Orders & Sales":"Pedidos e vendas",
  "Orders & Fulfillment":"Pedidos e logística","Shipping":"Envio","Wallet":"Carteira","Links":"Links","Integrations":"Integrações",
  "Users":"Utilizadores","Sellers":"Vendedores","Business Settings":"Definições da plataforma",
  "Product Review":"Revisão de produtos","Customer Reviews":"Avaliações de clientes","Categories":"Categorias",
  "Transactions":"Transações","Disputes":"Disputas","KYC":"KYC","My Products":"Meus produtos",
  "Support":"Suporte","Terms":"Termos","Privacy":"Privacidade",
  "Refund policy":"Política de reembolso","Acceptable use":"Utilização aceitável","Documentation":"Documentação",
  "Help":"Ajuda","Learn more":"Saiba mais","View details":"Ver detalhes","View":"Ver","Details":"Detalhes","Create":"Criar",
  "Update":"Atualizar","Remove":"Remover","Apply":"Aplicar","Reset":"Repor","Filter":"Filtrar","Filters":"Filtros","Sort":"Ordenar",
  "Sort by":"Ordenar por","Refresh":"Atualizar","Retry":"Tentar novamente","Continue":"Continuar","Continue shopping":"Continuar a comprar",
  "Go back":"Voltar","Done":"Concluído","Close":"Fechar","Open":"Abrir","Select":"Selecionar","Selected":"Selecionado",
  "Choose":"Escolher","Choose file":"Escolher ficheiro","Upload":"Carregar","Download":"Transferir","Export":"Exportar","Import":"Importar",
  "Copy":"Copiar","Copied":"Copiado","Generate":"Gerar","Send":"Enviar","Invite":"Convidar","Approve":"Aprovar","Reject":"Rejeitar",
  "Pending review":"Em revisão","Under review":"Em revisão","Review":"Revisão","Reviews":"Avaliações","Rating":"Avaliação",
  "Customer":"Cliente","Supplier":"Fornecedor","Seller":"Vendedor","Affiliate":"Afiliado","Admin":"Administrador",
  "Producer":"Produtor","Company name":"Nome da empresa","Full name":"Nome completo","First name":"Nome próprio","Last name":"Apelido",
  "Mobile":"Telemóvel","WhatsApp":"WhatsApp","Website":"Site","Tax ID":"NIF","Registration number":"Número de registo",
  "Created":"Criado","Updated":"Atualizado","Created at":"Criado em","Updated at":"Atualizado em","Date":"Data","Time":"Hora",
  "Today":"Hoje","Yesterday":"Ontem","This week":"Esta semana","This month":"Este mês","This year":"Este ano","Last 7 days":"Últimos 7 dias",
  "Last 30 days":"Últimos 30 dias","Revenue":"Receita","Sales revenue":"Receita de vendas","Profit":"Lucro","Margin":"Margem",
  "Commission":"Comissão","Conversion rate":"Taxa de conversão","Clicks":"Cliques","Conversions":"Conversões","Views":"Visualizações",
  "Visitors":"Visitantes","Products sold":"Produtos vendidos","Average order value":"Valor médio do pedido",
  "No data available":"Não existem dados disponíveis","No results found":"Nenhum resultado encontrado","No products found":"Nenhum produto encontrado",
  "No orders found":"Nenhum pedido encontrado","No customers found":"Nenhum cliente encontrado","Something went wrong":"Algo correu mal",
  "An error occurred":"Ocorreu um erro","Please try again":"Tente novamente","Required":"Obrigatório","Optional":"Opcional",
  "Yes":"Sim","No":"Não","Yes, delete":"Sim, eliminar","Are you sure?":"Tem a certeza?","Are you sure you want to continue?":"Tem a certeza de que pretende continuar?",
  "Are you sure you want to log out of your NewVelion account?":"Tem a certeza de que pretende sair da sua conta NewVelion?",
  "English":"Inglês","Portuguese":"Português","Language":"Idioma","Theme":"Tema","Dark mode":"Modo escuro","Light mode":"Modo claro",
  "Use dark mode":"Usar modo escuro","Use light mode":"Usar modo claro","Preferences":"Preferências","Platform preferences":"Preferências da plataforma",
  "Login":"Iniciar sessão","Register":"Registar","Password":"Palavra-passe","Confirm password":"Confirmar palavra-passe",
  "Forgot password?":"Esqueceu-se da palavra-passe?","Reset password":"Redefinir palavra-passe","Remember me":"Lembrar-me",
  "Welcome back":"Bem-vindo de volta","Welcome":"Bem-vindo","Already have an account?":"Já tem uma conta?",
  "Don't have an account?":"Ainda não tem uma conta?","Verify your email":"Verifique o seu e-mail","Email address":"Endereço de e-mail",
  "Confirm email":"Confirmar e-mail","Resend confirmation":"Reenviar confirmação","Sign in to your account":"Inicie sessão na sua conta",
  "Get started":"Começar","Get started today":"Comece hoje","View marketplace":"Ver mercado",
  "Browse products":"Explorar produtos","Browse suppliers":"Explorar fornecedores","Become a seller":"Torne-se vendedor",
  "Become a supplier":"Torne-se fornecedor","Start selling today":"Comece a vender hoje","Secure payment":"Pagamento seguro",
  "Secure payments":"Pagamentos seguros","Fast delivery":"Entrega rápida","Verified":"Verificado",
  "Available":"Disponível","Unavailable":"Indisponível","In stock":"Em stock","Out of stock":"Esgotado","Low stock":"Stock reduzido",
  "Stock":"Stock","SKU":"SKU","Category":"Categoria","Brand":"Marca","Product":"Produto",
  "Product details":"Detalhes do produto","Product information":"Informações do produto","Product description":"Descrição do produto",
  "Product name":"Nome do produto","Product price":"Preço do produto","Selling price":"Preço de venda","Compare at price":"Preço anterior",
  "Discount":"Desconto","Offer":"Oferta","Offers":"Ofertas","Featured offer":"Oferta em destaque","Limited offer":"Oferta limitada",
  "Add product":"Adicionar produto","New product":"Novo produto","Edit product":"Editar produto","Delete product":"Eliminar produto",
  "Publish product":"Publicar produto","Save product":"Guardar produto","Product catalog":"Catálogo de produtos","Catalog":"Catálogo",
  "Inventory":"Inventário","Stock management":"Gestão de stock","Fulfillment":"Logística","Order fulfillment":"Processamento de pedidos",
  "Shipping settings":"Definições de envio","Shipping zones":"Zonas de envio","Shipping rates":"Tarifas de envio",
  "Delivery":"Entrega","Delivery address":"Morada de entrega","Tracking number":"Número de rastreio","Track":"Rastrear",
  "Order number":"Número do pedido","Order status":"Estado do pedido","Order date":"Data do pedido","Customer information":"Informações do cliente",
  "Billing address":"Morada de faturação","Subtotal":"Subtotal","Shipping cost":"Custo de envio","Tax":"Imposto","Total amount":"Valor total",
  "Refund":"Reembolso","Refunded":"Reembolsado","Paid":"Pago","Unpaid":"Não pago","Processing":"Em processamento","Shipped":"Enviado",
  "Delivered":"Entregue","Cancelled":"Cancelado","Completed":"Concluído","Failed":"Falhou","Disputed":"Em disputa",
  "Withdrawal":"Levantamento","Withdrawal request":"Pedido de levantamento","Withdrawal amount":"Valor do levantamento",
  "Available balance":"Saldo disponível","Current balance":"Saldo atual","Balance":"Saldo","Bank account":"Conta bancária",
  "Payment method":"Método de pagamento","Payment methods":"Métodos de pagamento","Payout":"Pagamento","Payouts":"Pagamentos",
  "Add payment method":"Adicionar método de pagamento","Manage payment methods":"Gerir métodos de pagamento",
  "Commission rate":"Taxa de comissão","Commission amount":"Valor da comissão","Affiliate commission":"Comissão de afiliado",
  "Seller commission":"Comissão do vendedor","Supplier commission":"Comissão do fornecedor","Sales link":"Link de vendas",
  "Promo materials":"Materiais promocionais","Promotional materials":"Materiais promocionais","Performance":"Desempenho",
  "Overview":"Visão geral","Recent sales":"Vendas recentes","Recent orders":"Pedidos recentes","Top products":"Produtos mais vendidos",
  "Top sellers":"Vendedores de destaque","Top suppliers":"Fornecedores de destaque","Total sales":"Vendas totais","Total orders":"Pedidos totais",
  "Total customers":"Total de clientes","Total products":"Total de produtos","Total suppliers":"Total de fornecedores",
  "Total sellers":"Total de vendedores","Manage users":"Gerir utilizadores","Manage products":"Gerir produtos",
  "Manage suppliers":"Gerir fornecedores","Manage sellers":"Gerir vendedores","Platform settings":"Definições da plataforma",
  "Applications":"Candidaturas","Supplier applications":"Candidaturas de fornecedores","Seller applications":"Candidaturas de vendedores",
  "User management":"Gestão de utilizadores","Access":"Acesso","Role":"Função","Roles":"Funções","Permissions":"Permissões",
  "Security":"Segurança","Verification":"Verificação","Identity verification":"Verificação de identidade",
  "Approved suppliers":"Fornecedores aprovados","Approved sellers":"Vendedores aprovados","Pending applications":"Candidaturas pendentes",
  "Mark all as read":"Marcar tudo como lido","No notifications":"Sem notificações",
  "View all notifications":"Ver todas as notificações","New notification":"Nova notificação","Help center":"Centro de ajuda",
  "Contact support":"Contactar suporte","Contact us":"Contacte-nos","Send message":"Enviar mensagem","Message":"Mensagem",
  "Subject":"Assunto","Reply":"Responder","Action":"Ação","Actions":"Ações","Reason":"Motivo","Notes":"Notas",
  "Information":"Informação","General":"Geral","General settings":"Definições gerais","Business":"Negócio",
  "Business information":"Informações do negócio","Personal information":"Informações pessoais","Account settings":"Definições da conta",
  "Save changes":"Guardar alterações","Changes saved":"Alterações guardadas","Unsaved changes":"Alterações não guardadas",
  "Search...":"Pesquisar...","Search products...":"Pesquisar produtos...","Search users...":"Pesquisar utilizadores...",
  "Search orders...":"Pesquisar pedidos...","Search suppliers...":"Pesquisar fornecedores...","Search sellers...":"Pesquisar vendedores...",
  "Loading":"A carregar","Saving...":"A guardar...","Deleting...":"A eliminar...","Updating...":"A atualizar...","Creating...":"A criar...",
  "Please wait":"Aguarde","Try again":"Tentar novamente","Something went wrong.":"Algo correu mal.","Success":"Sucesso","Error":"Erro",
  "Warning":"Aviso","Info":"Informação","Required fields":"Campos obrigatórios","No changes":"Sem alterações",
  "products":"produtos","results":"resultados","items":"itens","item":"item","customers":"clientes","orders":"pedidos","sales":"vendas",
  "total":"total","from":"de","to":"até","of":"de","per":"por","each":"cada","all":"todos","none":"nenhum",
};

const wordTranslations: Record<string, string> = {
  dashboard:"painel", marketplace:"mercado", supplier:"fornecedor", suppliers:"fornecedores", seller:"vendedor", sellers:"vendedores",
  affiliate:"afiliado", customer:"cliente", customers:"clientes", admin:"administrador", product:"produto", products:"produtos",
  order:"pedido", orders:"pedidos", sale:"venda", sales:"vendas", commission:"comissão", commissions:"comissões", withdrawal:"levantamento",
  withdrawals:"levantamentos", payment:"pagamento", payments:"pagamentos", shipping:"envio", delivery:"entrega", settings:"definições",
  profile:"perfil", account:"conta", users:"utilizadores", user:"utilizador", category:"categoria", categories:"categorias",
  status:"estado", active:"ativo", inactive:"inativo", pending:"pendente", approved:"aprovado", rejected:"rejeitado", published:"publicado",
  draft:"rascunho", enabled:"ativado", disabled:"desativado", total:"total", price:"preço", cost:"custo", quantity:"quantidade",
  description:"descrição", name:"nome", email:"e-mail", phone:"telefone", mobile:"telemóvel", country:"país", company:"empresa",
  address:"morada", city:"cidade", state:"província", "postal":"postal", code:"código", revenue:"receita", profit:"lucro", margin:"margem",
  rate:"taxa", amount:"valor", balance:"saldo", wallet:"carteira", analytics:"análises", report:"relatório", reports:"relatórios",
  performance:"desempenho", clicks:"cliques", conversions:"conversões", views:"visualizações", visitors:"visitantes", conversion:"conversão",
  customer:"cliente", customers:"clientes", inventory:"inventário", stock:"stock", catalog:"catálogo", fulfillment:"logística",
  shipping:"envio", offer:"oferta", offers:"ofertas", review:"avaliação", reviews:"avaliações", rating:"avaliação", verified:"verificado",
  available:"disponível", unavailable:"indisponível", "in":"em", "out":"fora", secure:"seguro", checkout:"checkout", order:"pedido",
  details:"detalhes", information:"informação", general:"geral", business:"negócio", personal:"pessoal", notification:"notificação",
  notifications:"notificações", search:"pesquisar", save:"guardar", cancel:"cancelar", delete:"eliminar", edit:"editar", add:"adicionar",
  remove:"remover", back:"voltar", next:"seguinte", previous:"anterior", submit:"enviar", confirm:"confirmar", close:"fechar",
  open:"abrir", select:"selecionar", selected:"selecionado", choose:"escolher", upload:"carregar", download:"transferir", export:"exportar",
  import:"importar", copy:"copiar", create:"criar", update:"atualizar", apply:"aplicar", reset:"repor", filter:"filtrar", filters:"filtros",
  sort:"ordenar", "by":"por", view:"ver", manage:"gerir", new:"novo", old:"antigo", yes:"sim", no:"não", required:"obrigatório",
  optional:"opcional", date:"data", time:"hora", today:"hoje", yesterday:"ontem", week:"semana", month:"mês", year:"ano",
  "this":"este", "last":"último", "recent":"recente", "top":"principais", "all":"todos", "no":"não", "data":"dados", "available":"disponível",
  "loading":"a carregar", "saving":"a guardar", "deleting":"a eliminar", "updating":"a atualizar", "creating":"a criar",
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([en, pt]) => [pt, en]));

function replaceWords(value: string, toPortuguese: boolean) {
  const source = toPortuguese ? wordTranslations : Object.fromEntries(Object.entries(wordTranslations).map(([en, pt]) => [pt, en]));
  return value.replace(/\b[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*\b/g, (word) => {
    const key = word.toLowerCase();
    const replacement = source[key];
    if (!replacement) return word;
    if (word === word.toUpperCase()) return replacement.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    return replacement;
  });
}

function translateValue(value: string, toPortuguese: boolean) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (toPortuguese) {
    if (translations[trimmed]) return value.replace(trimmed, translations[trimmed]);
    return value.replace(trimmed, replaceWords(trimmed, true));
  }
  if (reverseTranslations[trimmed]) return value.replace(trimmed, reverseTranslations[trimmed]);
  return value.replace(trimmed, replaceWords(trimmed, false));
}

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
    const value = text.textContent ?? "";
    const next = translateValue(value, toPortuguese);
    if (next !== value) text.textContent = next;
  }

  const attrs = ["placeholder","aria-label","title","alt","value"];
  document.querySelectorAll<HTMLElement>("[" + attrs.join("],[") + "]").forEach((el) => {
    for (const attr of attrs) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const next = translateValue(value, toPortuguese);
      if (next !== value) el.setAttribute(attr, next);
    }
  });
}

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [pt, setPt] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("newvelion-theme");
    const storedLanguage = localStorage.getItem("newvelion-language");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = storedTheme ? storedTheme === "dark" : prefersDark;
    const nextPt = storedLanguage ? storedLanguage === "pt" : false;
    setDark(nextDark);
    setPt(nextPt);
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.lang = nextPt ? "pt" : "en";

    const observer = new MutationObserver(() => {
      const current = localStorage.getItem("newvelion-language") === "pt";
      translatePage(current);
    });
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
      <div className="newvelion-preferences" aria-label="Platform preferences">
        <button type="button" onClick={() => setPt(true)} className={pt ? "active" : ""}>PT</button>
        <button type="button" onClick={() => setPt(false)} className={!pt ? "active" : ""}>EN</button>
        <button type="button" onClick={() => setDark((v) => !v)} aria-label={dark ? "Use light mode" : "Use dark mode"}>
          {dark ? "☀" : "☾"}
        </button>
      </div>
    </>
  );
}
