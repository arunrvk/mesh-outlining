precision highp float;

uniform sampler2D textureSampler;
uniform sampler2D selectedSampler;
uniform vec2 textureSize;
uniform vec3 outlineColor;
uniform float outlinePixelSize;
varying vec2 vUV;

vec4 accessTexel(sampler2D tex, vec2 coord) {
    ivec2 tc = ivec2(floor(textureSize * coord));
    vec4 c = texelFetch(tex, tc, 0) + texelFetch(tex, tc, 1) + texelFetch(tex, tc, 2) + texelFetch(tex, tc, 3);
    return c;
}

void prepare_kernel(inout vec4 n[10], sampler2D tex, vec2 coord, float outlinePixelSize)
{
    float w = outlinePixelSize / textureSize.x;
    float h = outlinePixelSize / textureSize.y;

    n[0] = accessTexel(tex, coord + vec2( -2.0*w, h));
    n[1] = accessTexel(tex, coord + vec2( -w, h));
    n[2] = accessTexel(tex, coord + vec2( 0.0, h));
    n[3] = accessTexel(tex, coord + vec2( w, h));
    n[4] = accessTexel(tex, coord + vec2( 2.0*w, h));

    n[5] = accessTexel(tex, coord + vec2( w, -2.0*h));
    n[6] = accessTexel(tex, coord + vec2( w, -h));
    n[7] = accessTexel(tex, coord + vec2( w, 0.0));
    n[8] = accessTexel(tex, coord + vec2( w, h));
    n[9] = accessTexel(tex, coord + vec2( w, 2.0*h));
}

vec4 outline(sampler2D defaultTex, sampler2D selectedTex) {
    vec4 n[10];
    vec4 defaultTexColor = accessTexel(defaultTex, vUV);
    vec4 selectedTexColor = accessTexel(selectedTex, vUV);
    prepare_kernel(n, selectedTex, vUV, outlinePixelSize);

    if (length(selectedTexColor.xyz) > 1.0) {
        return defaultTexColor;
    }

    float numValid = 0.0;
    for(int i = 0; i < 10; ++i) {
        if (length(n[i].xyz) > 1.0) {
            numValid += 5.0;
        }
    }
    return vec4(mix(defaultTexColor.xyz, outlineColor.xyz, min(1.0, numValid / 5.0)), 1.0);
}

void main()
{
    glFragColor = outline(textureSampler, selectedSampler);
}