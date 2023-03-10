varying vec2 vUv;
varying vec3 vPosition;
void main(){
    vec4 modelPosition = modelMatrix * vec4(position,1.0);
    vUv = uv;
    vPosition = position;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}