uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Radial gradient from center
  float dist = length(uv - 0.5) * 1.5;
  
  // Subtle movement
  float noise = sin(uv.x * 3.0 + uTime * 0.2) * cos(uv.y * 2.0 + uTime * 0.15) * 0.05;
  dist += noise;
  
  vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 1.0, dist));
  
  // Subtle vignette
  float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5));
  color *= 0.7 + vignette * 0.3;
  
  gl_FragColor = vec4(color, 1.0);
}
