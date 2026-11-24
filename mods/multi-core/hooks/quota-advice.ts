import type { UsagePaneProps } from './usage-view.ts';

/** Only account summaries enter model context; receipts and worker data stay in the menu. */
export function quotaAdvice(snapshot?: UsagePaneProps): string {
  const instructions = [
    '[Seleção de modelo do Multi com base em cotas — aviso]',
    'Antes de escolher o modelo de um subagente, prefira o menor uso de assinatura entre os provedores habilitados cujos modelos sirvam para a tarefa.',
    'Respeite as escolhas explícitas de modelo do usuário. Você pode escolher um modelo mais usado quando suas capacidades servirem melhor à tarefa; este hook não restringe sua escolha.',
    'Use o uso atual, sem esperar pela renovação da cota. Prefira a capacidade incluída na assinatura a cobranças adicionais.',
    'As porcentagens descrevem cotas separadas por provedor, e não orçamentos iguais de tokens. Uma cota desconhecida não é uma cota não utilizada.',
  ];
  if (!snapshot) {
    return [
      ...instructions,
      'Não foi possível obter a cota atual. Escolha com base nos requisitos da tarefa.',
    ].join('\n');
  }
  const rows = snapshot.providers.filter((provider) => provider.status !== 'disabled');
  return [
    ...instructions,
    `Uso da conta verificado em ${snapshot.updatedAt}:`,
    ...rows.map(
      (provider) =>
        `${provider.name}: ${provider.status === 'ready' ? provider.summary : 'cota desconhecida ou indisponível'}`,
    ),
  ].join('\n');
}
