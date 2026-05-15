import styled, { keyframes } from 'styled-components';

// ─── Keyframes ────────────────────────────────────────────────────────────────

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const breathe = keyframes`
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.88); }
`;

const orbit = keyframes`
  0%   { transform: rotate(0deg)   scale(1); }
  50%  { transform: rotate(180deg) scale(1.06); }
  100% { transform: rotate(360deg) scale(1); }
`;

const barGrow = keyframes`
  0%, 100% { transform: scaleY(0.35); }
  50%       { transform: scaleY(1); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Spinner (inline) ─────────────────────────────────────────────────────────

export const Spinner = styled.div`
  width:  ${props => props.size || '36px'};
  height: ${props => props.size || '36px'};
  border-radius: 50%;
  border: 2.5px solid rgba(61, 129, 239, 0.14);
  border-top-color: #3D81EF;
  animation: ${spin} 0.75s linear infinite;
  flex-shrink: 0;
`;

export const PulseDot = styled.div`
  width:  ${props => props.size || '10px'};
  height: ${props => props.size || '10px'};
  background: linear-gradient(135deg, #427FD4, #7EC1F6);
  border-radius: 50%;
  animation: ${breathe} 1.2s ease-in-out infinite;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xl};
`;

// ─── Three-bar wave loader ────────────────────────────────────────────────────

const WaveWrap = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 28px;
`;

const Bar = styled.div`
  width: 4px;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #7EC1F6, #3D81EF);
  transform-origin: bottom;
  animation: ${barGrow} 0.9s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
`;

export const WaveLoader = () => (
  <WaveWrap>
    <Bar $delay="0s" />
    <Bar $delay="0.15s" />
    <Bar $delay="0.3s" />
    <Bar $delay="0.15s" />
  </WaveWrap>
);

// ─── Full-page loader ─────────────────────────────────────────────────────────

const PageLoaderWrap = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: linear-gradient(160deg, #ffffff 0%, #f4f8ff 60%, #eef3ff 100%);
  animation: ${slideUp} 0.3s ease-out;
`;

const GlowRing = styled.div`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #427FD4, #7EC1F6, #C4B8FC, #427FD4);
  background-size: 300% 300%;
  animation: ${orbit} 2.4s linear infinite;
  filter: blur(1px);
`;

const LogoMark = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
`;

const LogoInner = styled.div`
  position: relative;
  z-index: 1;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 1px rgba(61, 129, 239, 0.12),
    0 20px 48px rgba(61, 129, 239, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

const LogoLetter = styled.span`
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #427FD4 0%, #3D81EF 50%, #7EC1F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

const SkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: ${slideUp} 0.45s ease-out;
`;

const SkeletonLine = styled.div`
  height: 10px;
  border-radius: 999px;
  width: ${props => props.$w || '120px'};
  background: linear-gradient(
    105deg,
    #e8edf5 0%,
    #e8edf5 30%,
    rgba(255,255,255,0.82) 50%,
    #e8edf5 70%,
    #e8edf5 100%
  );
  background-size: 400px 100%;
  animation: shimPageLoad 1.4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};

  @keyframes shimPageLoad {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
`;

export const PageLoader = ({ label }) => (
  <PageLoaderWrap>
    <LogoMark>
      <GlowRing />
      <LogoInner>
        <LogoLetter>S</LogoLetter>
      </LogoInner>
    </LogoMark>
    <SkeletonLines>
      <SkeletonLine $w="96px"  $delay="0s" />
      <SkeletonLine $w="140px" $delay="0.1s" />
      <SkeletonLine $w="76px"  $delay="0.2s" />
    </SkeletonLines>
  </PageLoaderWrap>
);

// ─── Inline section loader (spinner + optional text) ──────────────────────────

const SectionLoaderWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 48px 24px;
  animation: ${slideUp} 0.3s ease-out;
`;

const SectionLabel = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: #9aa5b4;
  margin: 0;
  letter-spacing: 0.01em;
`;

export const SectionLoader = ({ label = 'Loading…' }) => (
  <SectionLoaderWrap>
    <Spinner size="32px" />
    <SectionLabel>{label}</SectionLabel>
  </SectionLoaderWrap>
);
