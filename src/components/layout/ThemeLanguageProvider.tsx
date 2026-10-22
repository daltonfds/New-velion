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
  "Newvelion Marketplace":"Mercado Newvelion","Discover products from verified suppliers.":"Descubra produtos de fornecedores verificados.",
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
  "Are you sure you want to log out of your Newvelion account?":"Tem a certeza de que pretende sair da sua conta Newvelion?",
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
  "Sign in to your Newvelion account.":"Inicie sessão na sua conta Newvelion.",
  "Welcome back,":"Bem-vindo de volta,","Log in / Sign in":"Iniciar sessão",
  "Log in":"Iniciar sessão",
  "Become an affiliate":"Torne-se afiliado","Supply it. Sell it. Track every rand.":"Forneça. Venda. Acompanhe cada rand.",
  "Two sides, one ledger":"Duas partes, um único registo","Suppliers and sellers each get a workspace. Everything they do together is recorded in the same place.":"Fornecedores e vendedores têm espaços de trabalho próprios. Todas as operações entre eles ficam registadas no mesmo local.",
  "List products, hold stock, fulfil orders and request payouts.":"Publique produtos, mantenha stock, processe pedidos e solicite levantamentos.",
  "Sellers and affiliates":"Vendedores e afiliados","Promote approved products with tracked links and earn commission.":"Promova produtos aprovados através de ligações rastreáveis e ganhe comissões.",
  "Administrators":"Administradores","Verify suppliers, approve products and review every payout.":"Verifique fornecedores, aprove produtos e analise todos os levantamentos.",
  "Customer Service":"Atendimento ao cliente","Help & Support":"Ajuda e suporte","My Account":"A minha conta","Wishlist":"Lista de desejos",
  "Business Account":"Conta empresarial","Become a Supplier":"Tornar-se fornecedor","All rights reserved.":"Todos os direitos reservados.",
  "Commerce infrastructure for modern commerce, sourcing and fulfillment.":"Infraestrutura de comércio para compras, aprovisionamento e logística modernos.",
  "Protected payments":"Pagamentos protegidos","South Africa delivery":"Entrega na África do Sul","Verified suppliers":"Fornecedores verificados",
  "Business buying":"Compras empresariais","Built for sourcing":"Criado para aprovisionamento","Real marketplace data":"Dados reais do mercado",
  "Real products and listings":"Produtos e anúncios reais","Try changing your search or status filter.":"Experimente alterar a pesquisa ou o filtro de estado.",
  "You must be signed in to view your sales.":"Tem de iniciar sessão para consultar as suas vendas.",
  "Unable to sign in.":"Não foi possível iniciar sessão.","Unable to establish your session. Please try again.":"Não foi possível iniciar a sua sessão. Tente novamente.",
  "Unable to sign in right now. Please try again.":"Não foi possível iniciar sessão neste momento. Tente novamente.",
  "Google sign-in is available only for buyer and affiliate accounts. Sellers and suppliers must use email and password.":"O início de sessão com Google está disponível apenas para clientes e afiliados. Vendedores e fornecedores devem usar o e-mail e a palavra-passe.",
  "Continue with Google":"Continuar com o Google","Email or password":"E-mail ou palavra-passe",
  // Contextual translations reviewed against the English source UI.
  "Create your seller account": "Crie a sua conta de vendedor",
  "Create your buyer account": "Crie a sua conta de cliente",
  "Create your supplier account": "Crie a sua conta de fornecedor",
  "Create your affiliate account": "Crie a sua conta de afiliado",
  "Start selling with Newvelion.": "Comece a vender com a Newvelion.",
  "Use your email, mobile number and password to shop and track your orders.": "Utilize o seu e-mail, número de telemóvel e palavra-passe para comprar e acompanhar os seus pedidos.",
  "Refer sellers and suppliers to Newvelion. Earn R50 when each referred business makes its first confirmed sale, and unlock mystery prizes as your active referrals grow.": "Recomende a Newvelion a vendedores e fornecedores. Ganhe R50 quando cada negócio recomendado realizar a sua primeira venda confirmada e desbloqueie prémios surpresa à medida que aumentam as suas referências ativas.",
  "Newvelion Partner Program": "Programa de parceiros Newvelion",
  "Become a platform affiliate": "Torne-se afiliado da plataforma",
  "Referral reward": "Prémio por referência",
  "After the first confirmed sale": "Após a primeira venda confirmada",
  "Milestone reward": "Prémio por objetivo",
  "Mystery prize": "Prémio surpresa",
  "At 5, 10 and 25 active referrals": "Ao atingir 5, 10 e 25 referências ativas",
  "Full name": "Nome completo",
  "Company name": "Nome da empresa",
  "Email address": "Endereço de e-mail",
  "Email": "E-mail",
  "Mobile number": "Número de telemóvel",
  "Password": "Palavra-passe",
  "Confirm password": "Confirmar palavra-passe",
  "Preferred language": "Idioma preferido",
  "I agree to the": "Concordo com os",
  "Terms of Service": "Termos de Serviço",
  "and acknowledge the": "e declaro que tomei conhecimento da",
  "Privacy Policy": "Política de Privacidade",
  "I have read and agree to the": "Li e aceito os",
  "Please accept the Terms of Service and Privacy Policy before continuing with Google.": "Aceite os Termos de Serviço e a Política de Privacidade antes de continuar com o Google.",
  "Please accept the Terms of Service and Privacy Policy.": "Aceite os Termos de Serviço e a Política de Privacidade.",
  "Please accept the Terms of Service and Privacy Policy to create an account.": "Aceite os Termos de Serviço e a Política de Privacidade para criar uma conta.",
  "Use a password with at least 8 characters.": "Utilize uma palavra-passe com pelo menos 8 caracteres.",
  "Password must contain at least 6 characters.": "A palavra-passe deve ter pelo menos 6 caracteres.",
  "Passwords do not match.": "As palavras-passe não coincidem.",
  "Please select your country.": "Selecione o seu país.",
  "Please enter your phone number.": "Introduza o seu número de telefone.",
  "Country and phone are required.": "O país e o número de telefone são obrigatórios.",
  "Creating account...": "A criar conta...",
  "Connecting to Google...": "A estabelecer ligação ao Google...",
  "Already have an account?": "Já tem uma conta?",
  "Already registered?": "Já está registado?",
  "New customer?": "É um novo cliente?",
  "Want to sell instead?": "Prefere vender?",
  "Want to sell?": "Quer vender?",
  "Create a seller account": "Criar uma conta de vendedor",
  "Create a buyer account": "Criar uma conta de cliente",
  "Create a supplier / producer account": "Criar uma conta de fornecedor/produtor",
  "Join as a platform affiliate": "Aderir como afiliado da plataforma",
  "Want to promote Newvelion?": "Quer promover a Newvelion?",
  "Want to promote Newvelion instead of selling products?": "Quer promover a Newvelion em vez de vender produtos?",
  "Are you a supplier or producer?": "É fornecedor ou produtor?",
  "or use email": "ou utilize o e-mail",
  "or sign in with email": "ou inicie sessão com o e-mail",
  "Unable to establish your session. Please try again.": "Não foi possível iniciar a sua sessão. Tente novamente.",
  "Supplier / Producer": "Fornecedor/produtor",
  "List your products, manage inventory and fulfill orders through Newvelion.": "Publique os seus produtos, gira o inventário e processe pedidos através da Newvelion.",
  "Supplier": "Fornecedor",
  "Rewards are recorded only after a first confirmed paid sale. Registrations alone do not count as active referrals.": "Os prémios só são registados após a primeira venda paga e confirmada. O simples registo não conta como referência ativa.",
  "Terms governing your use of the Newvelion platform, marketplace and related services.": "Termos que regem a utilização da plataforma Newvelion, do mercado e dos serviços associados.",
  "How Newvelion collects, uses, protects and shares personal information.": "Como a Newvelion recolhe, utiliza, protege e partilha informações pessoais.",
  "About Newvelion": "Sobre a Newvelion",
  "Acceptance": "Aceitação",
  "Eligibility": "Elegibilidade",
  "Accounts": "Contas",
  "Sellers and affiliate links": "Vendedores e ligações de afiliados",
  "Orders and payments": "Pedidos e pagamentos",
  "Commissions": "Comissões",
  "Withdrawals": "Levantamentos",
  "Buyer protection and refunds": "Proteção do comprador e reembolsos",
  "Prohibited conduct": "Condutas proibidas",
  "Intellectual property": "Propriedade intelectual",
  "Third-party services": "Serviços de terceiros",
  "Suspension and termination": "Suspensão e rescisão",
  "Availability": "Disponibilidade",
  "Limitation of liability": "Limitação de responsabilidade",
  "Changes": "Alterações",
  "Governing law": "Lei aplicável",
  "Contact": "Contacto",
  "Our commitment": "O nosso compromisso",
  "Information we collect": "Informações que recolhemos",
  "How we use information": "Como utilizamos as informações",
  "Legal bases": "Fundamentos jurídicos",
  "Sharing information": "Partilha de informações",
  "Customer delivery information": "Informações de entrega do cliente",
  "International transfers": "Transferências internacionais",
  "Retention": "Conservação dos dados",
  "Your rights": "Os seus direitos",
  "Cookies and tracking": "Cookies e rastreamento",
  "Marketing": "Marketing",
  "Children": "Crianças",
  "Privacy questions and requests can be sent to": "As questões e os pedidos relativos à privacidade podem ser enviados para",
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([en, pt]) => [pt, en]));


function translateValue(value: string, toPortuguese: boolean) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const translated = toPortuguese
    ? translations[trimmed]
    : reverseTranslations[trimmed];
  // Translate complete contextual phrases only. Never translate individual words:
  // doing so corrupts English phrases, grammar, product names and user-generated text.
  if (!translated) return value;
  return value.replace(trimmed, translated);
}

const originalTextNodes = new WeakMap<Text, { source: string; translated: string }>();
const originalAttributes = new WeakMap<Element, Map<string, { source: string; translated: string }>>();

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
    const current = text.textContent ?? "";
    const cached = originalTextNodes.get(text);
    const source = cached && current === cached.translated ? cached.source : current;
    const next = toPortuguese ? translateValue(source, true) : source;
    if (next !== current) text.textContent = next;
    if (next !== source || cached) {
      originalTextNodes.set(text, { source, translated: next });
    }
  }

  // Never translate input values: they may contain names, addresses or other user data.
  const attrs = ["placeholder", "aria-label", "title", "alt"];
  document.querySelectorAll<HTMLElement>("[" + attrs.join("],[") + "]").forEach((el) => {
    let elementCache = originalAttributes.get(el);
    if (!elementCache) {
      elementCache = new Map();
      originalAttributes.set(el, elementCache);
    }
    for (const attr of attrs) {
      const current = el.getAttribute(attr);
      if (!current) continue;
      const cached = elementCache.get(attr);
      const source = cached && current === cached.translated ? cached.source : current;
      const next = toPortuguese ? translateValue(source, true) : source;
      if (next !== current) el.setAttribute(attr, next);
      if (next !== source || cached) elementCache.set(attr, { source, translated: next });
    }
  });
}

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {

  const [pt, setPt] = useState(false);

  useEffect(() => {
    const initialLanguage = localStorage.getItem("newvelion-language") === "pt" ? "pt" : "en";
    setPt(initialLanguage === "pt");
    document.documentElement.lang = initialLanguage;
    document.documentElement.classList.remove("dark");

    let scheduled = false;
    const applyLanguage = () => {
      scheduled = false;
      observer.disconnect();
      translatePage(localStorage.getItem("newvelion-language") === "pt");
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(applyLanguage);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const onLanguageChange = () => {
      const language = localStorage.getItem("newvelion-language") === "pt" ? "pt" : "en";
      setPt(language === "pt");
      document.documentElement.lang = language;
      translatePage(language === "pt");
    };
    window.addEventListener("newvelion-language-change", onLanguageChange);
    translatePage(initialLanguage === "pt");
    return () => {
      observer.disconnect();
      window.removeEventListener("newvelion-language-change", onLanguageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = pt ? "pt" : "en";
    localStorage.setItem("newvelion-language", pt ? "pt" : "en");
    translatePage(pt);
  }, [pt]);

  return (
    <>
      {children}
    </>
  );
}
