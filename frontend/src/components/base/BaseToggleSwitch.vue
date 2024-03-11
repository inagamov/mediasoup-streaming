<template>
  <div class="flex items-center">
    <input
      :value="modelValue"
      type="checkbox"
      id="toggle"
      class="checkbox"
      @change="$emit('update:modelValue', Boolean($event?.target?.value))"
    />
    <label for="toggle" class="switch cursor-pointer"></label>
  </div>
</template>

<script setup lang="ts">
defineProps({ modelValue: { type: [Boolean], default: false } });
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 54px;
  height: 28px;
  background-color: #d1d1d1;
  border-radius: 20px;
}

.switch::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 4px;
  left: 4px;
  transition: all 0.3s;
}

@media (prefers-color-scheme: dark) {
  .switch {
    background-color: #1a1a1a;
  }
  .switch::after {
    background-color: white;
  }
  .checkbox:checked + .switch:after {
    background-color: white;
  }
}

.checkbox {
  display: none;
}
.checkbox:checked + .switch::after {
  left: 30px;
}
.checkbox:checked + .switch {
  background-color: #2463eb;
}
</style>
