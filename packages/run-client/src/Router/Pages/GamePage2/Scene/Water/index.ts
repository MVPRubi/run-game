import {
  PlaneGeometry,
  BoxGeometry,
  Color,
  DoubleSide,
  ShaderMaterial,
  Mesh,
  Clock,
} from "three";

const vertexShader = () => {
  return `
#define PI 3.14159265359

uniform float u_time;
uniform float u_pointsize;
uniform float u_noise_amp_1;
uniform float u_noise_freq_1;
uniform float u_spd_modifier_1;
uniform float u_noise_amp_2;
uniform float u_noise_freq_2;
uniform float u_spd_modifier_2;

varying vec3 v_normal;
varying float v_offset;
varying vec3 v_position;
varying float v_depth;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                        vec2(12.9898,78.233)))
                * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
              sin(angle),cos(angle));
}

void main() {
  gl_PointSize = u_pointsize;

  vec3 pos = position;
  v_offset = noise(pos.xy * u_noise_freq_1 + u_time * u_spd_modifier_1) * u_noise_amp_1;
  // pos.xy is the original 2D dimension of the plane coordinates
  pos.z += v_offset;
  // add noise layering
  // minus u_time makes the second layer of wave goes the other direction
  pos.z += noise(rotate2d(PI / 4.) * pos.yx * u_noise_freq_2 - u_time * u_spd_modifier_2 * 0.6) * u_noise_amp_2;

  vec4 mvm = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvm;
  v_normal = normalMatrix * normal;
  v_position = vec3(modelMatrix * vec4(position, 1.0));
  v_depth = gl_Position.z / gl_Position.w;
}
`;
};

const fragmentShader = () => {
  return `
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec3 u_color;
uniform vec3 u_color2;
uniform vec3 u_lightColor;
uniform vec3 u_lightpostion;
uniform vec3 u_camerapostion;

varying vec3 v_normal;
varying float v_offset;
varying vec3 v_position;
varying float v_depth;

void main() {
  vec3 lightDirection = normalize(u_lightpostion - v_position);
  vec3 viewDirection = normalize(u_camerapostion - v_position);
  // // 漫反射

  // float diffuse = max(dot(v_normal, lightDirection), 0.0);

  // // 镜面反射

  // vec3 reflectDirection = reflect(-lightDirection, v_normal);
  // float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 10.0);

  // // 最终颜色

  // vec3 color = u_color * diffuse + u_color2 * specular;

  // // color = mix(color, vec3(0.0), 0.1);

  // gl_FragColor = vec4(color, 0.9);
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  float displacement = v_offset;
  vec3 n_normal = normalize(v_normal + displacement);
  vec3 lightDir = normalize(u_lightpostion - n_normal);
  float nDotL = pow(max(dot(n_normal, lightDirection), 0.0), 2.0);
  vec3 diffuse = nDotL * u_color;
  //  displacement 越大 u_color, 越小接近 u_color2
  diffuse = mix( u_color2, u_color, nDotL);
  vec3 ambient = 0.1 * u_lightColor;
  vec3 reflectDir = reflect(lightDirection, n_normal);
  vec3 viewDir = normalize(u_camerapostion - n_normal);
  vec3 halfwayDir = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(n_normal, halfwayDir), 0.0), 128.0);

  gl_FragColor = vec4( diffuse, 0.9);
}
`;
};

const uniforms = {
  u_time: { value: 0.0 },
  // wave 1
  u_noise_freq_1: { value: 1.0 },
  u_noise_amp_1: { value: 0.2 },
  u_spd_modifier_1: { value: 1.0 },
  // wave 2
  u_noise_freq_2: { value: 2.0 },
  u_noise_amp_2: { value: 0.3 },
  u_spd_modifier_2: { value: 0.8 },
  u_lightColor: { value: new Color(0xffffff) },
  u_color: { value: new Color(0xffffff) },
  u_color2: { value: new Color(0x5bdbff) },
};

export const renderWater = ({ light, camera }) => {
  const waterPlane = new BoxGeometry(40, 40, 10, 128, 128, 128);
  const material = new ShaderMaterial({
    side: DoubleSide,
    transparent: true,
    uniforms: {
      ...uniforms,
      ...{
        u_lightpostion: { value: light.position },
        u_camerapostion: { value: camera.position },
      },
    },
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
  });
  const mesh = new Mesh(waterPlane, material);
  mesh.rotation.x = -Math.PI / 2;

  const clock = new Clock();
  const update = () => {
    const elapsed = clock.getElapsedTime();
    uniforms.u_time.value = elapsed;
  };
  return { mesh, update };
};
