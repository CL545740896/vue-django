/**
 * Created by denishuang on 2018/4/23.
 */

import Qs from 'qs'
import filters from '../utils/filters'
import server_response from './server_response'
export default{
    props: {
        // tableItems: {
        //     type: Array,
        //     default: []
        // },
    },
    data () {
        return {
            tableQueries: {},
            tableData: [],
            tablePageSize: 20,
            tablePage: 1,
            tableCount: 0,
            tableUrl: "",
            tableItems: [],
            tableSearchFields: []
        }
    },
    mixins: [server_response],
    filters: filters,
    // mounted () {
    //     this.tableUpdateQueries({page: 1, page_size: this.pageSize, search: ''})
    //     // this.$store.state.bus.$on('model-posted', this.onModelPosted)
    //     // console.log(this.$store)
    // },
    beforeDestroy () {
        // this.$store.state.bus.$off('model-posted', this.onModelPosted)
    },
    components: {},
    methods: {
        // onModelPosted({model}){
        //     if (model.fullName === this.model.fullName || this.model.dependents && this.model.dependents.indexOf(model.fullName) >= 0) {
        //         this.load()
        //     }
        // },

        _fields(){
            let fm = this.fieldMetas
            return this.fields.map((f) => {
                if (typeof f == 'string') {
                    let d = fm[f]
                    if (d) {
                        return {name: f, label: d.label, type: d.type, widget: this.getWidget(d.type)}
                    } else {
                        return {name: f, label: f}
                    }
                }
                return f
            })
        },
        tableUpdateQueries(d){
            this.tableQueries = Object.assign({}, this.tableQueries, d)
        },
        tableLoad () {
            let d = this.tableQueries
            this.loading = '查询中'
            // console.log(this.tableUrl)
            this.$http.get(`${this.tableUrl}?${Qs.stringify(d)}`).then(({data}) => {
                this.tableData = data.results
                this.tableCount = data.count
                this.loading = false
                // this.$emit("loaded", data)
            }).catch(this.onServerResponseError)
        },
        tableOnSearch(){
            this.tableUpdateQueries({})
        },
        tableOnRowSelect(row, column, cell, event){
            this.tableToEditModel(row, column, cell, event)
        },
        tableToEditModel (row, column, cell, event){
            this.$router.replace(`${row.id}/`)
        },
        tableToCreateModel(){
            let url = `${this.modelListUrl}create/?${this.modelConfig.title_field}=${this.tableQueries.search}`
            console.log(url)
            this.$router.push(url)
        },
        tableOnPageChanged (val) {
            this.tablePage = val
        },
        tableOnPageSizeChanged (val){
            this.tablePageSize = val
        },
        tableDefaultWidget(f){

        },
        tableNormalizeItems(tableItems){
            return tableItems.map((i) => {
                let a, field
                if (typeof i == 'string') {
                    field = this.modelFieldConfigs[i]
                    a = {name: i, label: field.label, type: field.type}
                } else {
                    field = this.modelFieldConfigs[i.name]
                    a = Object.assign({}, {label: field.verboseName, type: field.type}, i)
                }

                a.widget = a.widget || this.tableDefaultWidget(a)
                // console.log(a)
                return a
            })
        }
    },
    computed: {

        tableSearchFieldNames () {
            return this.tableSearchFields.join(',')
        },
    },
    watch: {
        tablePage(newVal, oldVal){
            this.updateQueries({page: newVal})
        },
        tablePageSize(newVal, oldVal){
            this.updateQueries({page_size: newVal})
        },
        tableQueries(newVal, oldVal){
            this.tableLoad()
        }
    }
}