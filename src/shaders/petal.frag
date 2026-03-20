// Petal fragment shader
uniform vec3 uColorInner;   // center color
uniform vec3 uColorOuter;   // tip color
uniform vec3 uColorVein;    // vein accent
uniform float uBloom;
uniform float uTime;
uniform float uPetalIndex;

varying vec2 vUv;
varying float vDistFromCenter;
varying float vPetalFold;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec2 uv = vUv;
  
  // === BASE COLOR: gradient from center to tip ===
  float gradient = smoothstep(0.0, 0.8, vDistFromCenter);
  vec3 baseColor = mix(uColorInner, uColorOuter, gradient);
  
  // === VEIN PATTERN ===
  // Central vein
  float centerVein = 1.0 - smoothstep(0.0, 0.06, abs(uv.x - 0.5));
  centerVein *= smoothstep(0.0, 0.3, vDistFromCenter); // fade at base
  
  // Side veins branching from center
  float veinFreq = 8.0;
  float sideVein = sin(uv.x * veinFreq * 3.14159) * 0.5 + 0.5;
  sideVein = pow(sideVein, 8.0); // sharp veins
  sideVein *= smoothstep(0.1, 0.5, vDistFromCenter) * (1.0 - smoothstep(0.7, 1.0, vDistFromCenter));
  
  float veins = max(centerVein * 0.4, sideVein * 0.15);
  baseColor = mix(baseColor, uColorVein, veins);
  
  // === SUBTLE COLOR VARIATION ===
  float variation = sin(uv.x * 20.0 + uPetalIndex) * sin(uv.y * 15.0) * 0.03;
  baseColor += variation;
  
  // === PETAL EDGE SOFTNESS ===
  // Soft edges on sides
  float edgeFade = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
  // Soft tip
  float tipFade = smoothstep(1.0, 0.85, uv.y);
  // Soft base (connects to center)
  float baseFade = smoothstep(0.0, 0.05, uv.y);
  float alpha = edgeFade * tipFade * baseFade;
  
  // === PETAL TIP SHAPE (make rounded, not square) ===
  float tipDist = length(vec2((uv.x - 0.5) * 2.0, (uv.y - 0.9) * 5.0));
  if (uv.y > 0.85) {
    alpha *= smoothstep(1.2, 0.8, tipDist);
  }
  
  // === LIGHTING ===
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
  float diffuse = max(dot(vWorldNormal, lightDir), 0.0) * 0.4 + 0.6;
  
  // Subsurface scattering fake (light through petals)
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float sss = pow(max(dot(viewDir, -lightDir), 0.0), 2.0) * 0.3;
  
  vec3 finalColor = baseColor * diffuse + baseColor * sss;
  
  // Slight sheen at edges (fresnel)
  float fresnel = pow(1.0 - abs(dot(normalize(viewDir), vWorldNormal)), 3.0);
  finalColor += vec3(1.0) * fresnel * 0.1;
  
  // === BLOOM GLOW ===
  // Flash of light when blooming
  float bloomFlash = smoothstep(0.3, 0.6, uBloom) * smoothstep(0.9, 0.6, uBloom);
  finalColor += uColorOuter * bloomFlash * 0.3;
  
  gl_FragColor = vec4(finalColor, alpha);
}
