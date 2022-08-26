<template>
  <client-only>
    <div class="field col-12">
      <Chart type="doughnut" :data="chartData" :options="lightOptions" />
    </div>
    <div class="field col-12">
      <Calendar v-model="calendarDate" :inline="true" />
      <span role="figure">{{calendarDate}}</span>
    </div>
    <div class="field col-12">
      <PrimeVueEditor v-model="editor" editorStyle="height: 320px"/>
      <span>{{editor}}</span>
      <blockquote v-if="editor" class="mt-3 mb-0 shadow-2 border-round p-3" style="background: #fff;" v-html="editor" />
    </div>
  </client-only>
  <div class="field col-12">
    <h2><em>Rick &amp; Morty™</em> Characters</h2>
    <div>
      <span class="tip" v-if="charactersLoading">Loading...</span>
    </div>
    <client-only>
      <ul v-if="characters">
        <li v-for="character in characters.characters.results" :key="character.name">{{ character.name }}</li>
      </ul>
      <span v-else-if="error">
        Error: {{error}}
      </span>
    </client-only>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import Calendar from 'primevue/calendar'
import Chart from 'primevue/chart'
import { useRickAndMortyCharactersQuery } from 'gql'

const { fetching: charactersLoading, data: characters, error: charactersError } = useRickAndMortyCharactersQuery()

const calendarDate = ref(null)

const editor = ref(null)

const chartData = ref({
    labels: ['A','B','C'],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: ["#42A5F5","#66BB6A","#FFA726"],
            hoverBackgroundColor: ["#64B5F6","#81C784","#FFB74D"]
        }
    ]
})

const lightOptions = {
    plugins: {
        legend: {
            labels: {
                color: '#495057'
            }
        }
    }
}
</script>

<style scoped>
.p-calendar {
  width: 100%;
}
</style>
