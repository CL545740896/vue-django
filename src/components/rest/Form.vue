<template>
    <div>
        <el-form ref="form" :inline="formInline" :size="formSize" :model="formValue" v-if="value"
                 :inline-message="formInline" :hide-required-asterisk="formHideRequiredAsterisk"
                 label-position="right" :label-width="formNoLabel && '0px' || formLabelWidth"
                 v-loading="loading"
                 :element-loading-text="loading">

            <slot name="header"></slot>
            <el-alert :title="formErrors.non_field_errors" type="error" v-if="formErrors.non_field_errors"
                      :closable="false"></el-alert>
            <el-row>
                <template v-for="f in _formItems">
                    <el-col :xs="f.span.xs" :sm="f.span.sm" :md="f.span.md" :lg="f.span.lg" :xl="f.span.xl"
                            :key="f.name" v-if="f.widget !== 'hidden'">
                        <el-form-item :prop="f.name" :rules="f.rules" :label="f.label" :error="formErrors[f.name]"
                                      :ref="f.name" :style="formNoLabel && {} || formItemStyle">
                            <template slot="label" v-if="!formNoLabel">
                                {{f.label}}
                                <el-tooltip placement="top" v-if="f.help_text">
                                    <div slot="content" v-html="f.help_text"></div>
                                    <i class="fa fa-info-circle bg-info"></i>
                                </el-tooltip>
                            </template>
                            <template slot="label" v-else><span></span></template>
                            <template>
                                <form-widget v-model="formValue" :field="f"></form-widget>
                            </template>
                        </el-form-item>
                    </el-col>
                </template>
                <slot name="submit">
                    <el-col :xs="formInline?12:24" :sm="formInline?8:24" :md="formInline?6:24" :lg="formInline?4:24" :xl="formInline?3:24">
                        <el-form-item>
                            <el-button :type="a.type || 'primary'" @click="a.do" v-for="a in _actions" :key="a.name">{{a.label}}</el-button>
                        </el-form-item>
                    </el-col>
                </slot>
            </el-row>
        </el-form>
    </div>
</template>
<script>
    import form_view from '../../mixins/form_view'
    import FormWidget from '../widgets/FormWidget.vue'
    export default{
        mixins: [
            form_view
        ],
        props: {
            value: Object,
            actions: Array,
            formNoLabel: {
                type: Boolean,
                default: () => false
            }
        },
        components: {
            FormWidget
        },
        created(){
            this.formValue = this.value
        },
        watch: {
            value(val){
                this.formValue = val
            }
        },
        computed: {
            _actions () {
                return this.actions || [{name:'submit',label:this.formSubmitName, do:this.onSubmit}]
            }
        }
    }
</script>

