// Petal vertex shader
uniform float uBloom;       // 0 = closed bud, 1 = fully open
uniform float uTime;
uniform float uPetalIndex;  // which petal (for variation)
uniform float uTotalPetals;
uniform float uLayerIndex;  // inner/outer layer

varying vec2 vUv;
varying float vDistFromCenter;
varying float vPetalFold;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Petal shape: curve upward from base
  float distFromBase = uv.y; // 0 at base, 1 at tip
  vDistFromCenter = distFromBase;
  
  // === BLOOM ANIMATION ===
  // Opening angle: from nearly vertical (bud) to laying open
  float layerDelay = uLayerIndex * 0.15; // outer petals open later
  float bloomProgress = clamp((uBloom - layerDelay) / (1.0 - layerDelay), 0.0, 1.0);
  bloomProgress = smoothstep(0.0, 1.0, bloomProgress);
  
  // Bud state: petals curve inward (toward center)
  float budAngle = 0.15; // nearly closed
  // Bloom state: petals curve outward and down
  float bloomAngle = 1.2 + uLayerIndex * 0.3;
  float openAngle = mix(budAngle, bloomAngle, bloomProgress);
  
  // Bend petal along its length (rotate around base)
  float bendAmount = distFromBase * openAngle;
  float origY = pos.y;
  float origZ = pos.z;
  pos.y = origY * cos(bendAmount) - origZ * sin(bendAmount);
  pos.z = origY * sin(bendAmount) + origZ * cos(bendAmount);
  
  // Petal curl at edges (more when open)
  float curlAmount = sin(uv.x * 3.14159) * 0.15 * distFromBase * bloomProgress;
  pos.z += curlAmount;
  
  // Subtle twist
  float twist = (uv.x - 0.5) * distFromBase * 0.3 * bloomProgress;
  float twistAngle = twist;
  float tmpX = pos.x;
  pos.x = tmpX * cos(twistAngle) - pos.z * sin(twistAngle);
  pos.z = tmpX * sin(twistAngle) + pos.z * cos(twistAngle);
  
  // Petal fold (concavity) — more pronounced in bud, flatter when open
  float foldAmount = mix(0.4, 0.1, bloomProgress);
  float fold = sin(uv.x * 3.14159) * foldAmount * distFromBase;
  pos.z -= fold;
  vPetalFold = fold;
  
  // Gentle breathing/wind motion
  float windStrength = 0.03 + 0.02 * bloomProgress;
  pos.x += sin(uTime * 1.5 + uPetalIndex * 2.0 + distFromBase * 2.0) * windStrength * distFromBase;
  pos.z += cos(uTime * 1.2 + uPetalIndex * 1.5) * windStrength * 0.5 * distFromBase;
  
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
