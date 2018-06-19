/**
 * Created by denishuang on 2018/4/23.
 */
import model_view from './model_view'
import table_view from './table_view'

import TrueFlag from '../components/widgets/TrueFlag.vue'
import ChoicesDisplay from '../components/widgets/ChoicesDisplay.vue'
import Date2Now from '../components/widgets/Date2Now.vue'
import ForeignKey from '../components/widgets/ForeignKey.vue'
export default {
    mixins: [model_view, table_view],
    props: {
        appModelName: String,
        tableItems: {
            type: Array, default: function () {
                return [{name: '__str__', label: '名称'}]
            }
        },
        extraActions: {
            type: Object, default: function () {
                return {}
            }
        },
        modelTableUrl: String,
        topActionList: {
            type: Array, default: function () {
                return ['refresh', 'create']
            }
        },
        rowActionList: {
            type: Array, default: function () {
                return ['edit']
            }
        },
        showTopBar: {
            type: Boolean, default: function () {
                return true
            }
        },
        showPagger: {
            type: Boolean, default: function () {
                return true
            }
        }
    },
    data () {
        return {
            modelTableFilters: {},
            modelTableOrderingFields: [],
            modelTableFilterFields: [],
            modelTableSearchFields: [],
            modelTableItems: [],
            modelTableAvairableActions: {
                'refresh': {
                    icon: 'refresh',
                    title: '刷新',
                    do: this.tableLoad
                },
                'create': {
                    icon: 'plus',
                    title: '创建',
                    do: this.tableToCreateModel
                },
                'edit': {
                    icon: 'pencil',
                    title: '编辑',
                    do: this.tableToEditModel
                }
            }
        }
    },
    created(){
        this.$store.state.bus.$on('model-posted', this.modelTableOnModelPosted)
    },
    beforeDestroy () {
        this.$store.state.bus.$off('model-posted', this.modelTableOnModelPosted)
    },
    components: {},
    methods: {
        modelTableInit(){
            this.modelInit()
            this.tableUrl = this.modelTableUrl || this.modelListUrl
            this.tableUpdateQueries({})
            this.modelLoadOptions().then((data) => {
                let search = this.modelOptions.actions.SEARCH
                this.modelTableOrderingFields = search.ordering_fields
                this.modelTableSearchFields = search.search_fields
                this.modelTableFilterFields = search.filter_fields.map((a) => {
                    return Object.assign({multiple: false}, this.modelFieldConfigs[a])
                })
                Object.assign(this.modelTableFilters, this.getFilters())
                this.modelTableItems = this.tableNormalizeItems(this.tableItems)
            })
        },
        modelTableOnModelPosted({model}){
            if (model.fullName === this.appModelName || this.modelConfig.dependents && this.modelConfig.dependents.indexOf(model.fullName) >= 0) {
                this.tableLoad()
            }
        },
        tableOnRowSelect(row, column, cell, event){
            if (this.rowActionList.includes('edit')) {
                this.tableToEditModel(row, column, cell, event)
            }
        },
        tableToEditModel (row, column, cell, event){
            this.$router.replace(`/${this.appModelName.replace('.', '/')}/${row.id}/`)
        },
        tableToCreateModel(){
            let url = `${this.modelListUrl}create/?${this.modelConfig.title_field}=${this.tableQueries.search}`
            console.log(url)
            this.$router.push(url)
        },
        tableNormalizeItems(tableItems){
            return tableItems.map((i) => {
                let a, field
                if (typeof i == 'string') {
                    field = this.modelFieldConfigs[i]
                    if (!field) {
                        console.error(`field ${i} not found`)
                    }
                    a = {name: i, label: field.label || field.name, type: field.type, model: field.model, choices:field.choices, field}
                } else {
                    field = this.modelFieldConfigs[i.name]
                    a = Object.assign({}, {
                        label: field.label || field.name,
                        type: field.type,
                        model: field.model,
                        choices:field.choices,
                        field
                    }, i)
                }

                a.widget = a.widget || this.tableDefaultWidget(a)
                // console.log(a)
                return a
            })
        },

        tableDefaultWidget(f){
            // console.log(f)
            return f.model ? ForeignKey :
                (f.type == 'boolean' ? TrueFlag :
                    ( ['datetime', 'date'].includes(f.type) ? Date2Now :
                        f.choices ? ChoicesDisplay : undefined))
        },
        choices2selectOptions(choices){
            return choices.map((a) => {
                return {text: a.display_name, value: a.value}
            })
        },

        getFilters(){
            let postFields = this.modelFieldConfigs
            let filters = {}

            Object.keys(postFields).forEach((k) => {
                let f = postFields[k]
                if (f.choices) {
                    filters[`${k}_name`] = filters[k] = this.choices2selectOptions(f.choices)
                }
            })
            return filters
        }
    },
    computed: {
        modelTableSearchFieldNames () {
            return this.modelTableSearchFields.join(',')
        },

        modelTableTitle(){
            return `${this.modelConfig.verbose_name}列表`
        },
    }
}