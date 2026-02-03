package system

import "github.com/itchyny/volume-go"

func GetSystemVolume() int {
	value, err := volume.GetVolume()
	if err != nil {
		return 100
	}
	if value < 0 {
		return 0
	}
	if value > 100 {
		return 100
	}
	return value
}

func SetSystemVolume(value int) int {
	if value < 0 {
		value = 0
	} else if value > 100 {
		value = 100
	}
	_ = volume.SetVolume(value)
	return value
}
