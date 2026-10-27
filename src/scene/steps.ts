/**
 * Estados da câmera/objeto para cada etapa da desmontagem.
 * Este arquivo não importa three — a timeline de scroll anima o objeto `S`
 * antes mesmo do 3D carregar, e a cena só lê esses valores a cada quadro.
 */
export interface SceneState {
  cx: number; cy: number; cz: number // posição da câmera
  tx: number; ty: number; tz: number // alvo
  explode: number // 0 montado → 1 explodido
  coil: number // bobinas saindo do núcleo
  glow: number // brilho âmbar das válvulas
  fT: number // foco: válvulas
  fX: number // foco: transformadores
  fB: number // foco: circuito
  dim: number // esmaecimento do que não está em foco
  rot: number // rotação do objeto (rad)
  shift: number // deslocamento lateral do objeto na tela (fração da largura)
}

const base: SceneState = {
  cx: 6.0, cy: 3.6, cz: 8.1,
  tx: 0, ty: 0.6, tz: 0,
  explode: 0, coil: 0, glow: 0.8,
  fT: 0, fX: 0, fB: 0, dim: 0,
  rot: 0, shift: 0.2,
}

export const KEYS: SceneState[] = [
  // 1. Montado
  { ...base },
  // 2. Desmontar
  { ...base, cx: 9.4, cy: 5.6, cz: 11.6, ty: 1.15, explode: 1, glow: 0.65, shift: 0.15 },
  // 3. As válvulas
  { ...base, cx: 2.9, cy: 3.9, cz: 5.9, tx: 0, ty: 3.05, tz: 0.7, explode: 1, glow: 1.15, fT: 1, dim: 1, shift: 0.1 },
  // 4. Os transformadores
  { ...base, cx: 7.0, cy: 5.5, cz: 7.0, tx: 0, ty: 2.1, tz: 1.3, explode: 1, coil: 1, glow: 0.55, fX: 1, dim: 1, rot: Math.PI, shift: 0.15 },
  // 5. O circuito
  { ...base, cx: 2.0, cy: 3.4, cz: 5.9, tx: 0, ty: -0.05, tz: 0.3, explode: 1, glow: 0.5, fB: 1, dim: 1, rot: Math.PI * 2, shift: 0.15 },
  // 6. Remontado
  { ...base, rot: Math.PI * 2, glow: 1.05 },
]

/** Estado vivo, animado pela timeline de scroll e lido pela cena. */
export const S: SceneState = { ...KEYS[0] }

/** Close de válvulas acesas (imagem da seção do ateliê). */
export const CLOSEUP: SceneState = {
  ...base,
  cx: 1.6, cy: 2.15, cz: 3.0,
  tx: -0.75, ty: 1.55, tz: 0.35,
  glow: 1.35, fT: 1, dim: 0.55, shift: 0,
}
