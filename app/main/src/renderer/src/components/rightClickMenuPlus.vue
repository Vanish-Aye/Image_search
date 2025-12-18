<template>
  <div class="menuField">
    <label
      class="opLabel"
      v-for="[optionName,Func] in props.options.entries()"
      :key="optionName"
      @click="()=>{ Func();props.onClose() }"
    >
      <span class="option">{{ optionName }}</span>
      <span
        v-if="optionName.endsWith('_DVI')"
        class="Divid_Line"
      />
    </label>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from "vue";
import type { RightClickMenuPlusProps } from "src/node/webpreload";
const props = defineProps<RightClickMenuPlusProps>()

</script>

<style lang="scss" scoped>
.menuField {
  display: flex;
  max-width: 350px;
  min-width: 250px;
  outline: #006eff;
  flex-direction: column;
  color: var(--gen-txt-color);
  border-radius: 6px;
  border: 1px solid #797979;
  background-color:  rgb(from var(--right-click-menu-bkcolor) calc(r + 10) calc(g + 10) calc(b + 10));

  .opLabel {
    display: flex;
    position: relative;
    width: auto;
    height: 40px;
    border-radius: 6px;
    align-items: center;
    cursor: pointer;
    
    .option {
      display: flex;
      flex-grow: 1;
      height: 100%;
      border-radius: 2px;
      text-align: left;
      padding-left: 5px;
      align-items: center;
    }
  }

  .opLabel:hover .option{
    background-color: deepskyblue;
  }
}

.Divid_Line {
  position: absolute;
  bottom: 0px;
  height: 1px;
  width: 100%;
  background-color: #797979;;
}
</style>
  